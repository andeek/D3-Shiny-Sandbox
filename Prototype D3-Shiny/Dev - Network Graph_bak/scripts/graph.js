<style>
.node {
  stroke: #fff;
  stroke-width: 1.5px;
}

.node .selected {
  stroke: red;
}

.hidden {
  stroke-width: 0px;
  opacity: 0;
}

.link {
  stroke: #999;
}

.brush .extent {
  fill-opacity: .1;
  stroke: #fff;
  shape-rendering: crispEdges;
}

.control {   
  margin-bottom: 5px;  
  height: 44px;
}

.button{
  float: left;
  margin-left: 5px;
  width: 44px !important;  
}
</style>
<script src="http://d3js.org/d3.v3.js"></script>
<script type="text/javascript">

var dataset;
var group_indx = 0;
var outputBinding = new Shiny.OutputBinding();
$.extend(outputBinding, {
  find: function(scope) {
    return $(scope).find('.d3graph');
  },
  renderValue: function(el, data) {  
	  force_wrapper(el, data);
}});
Shiny.outputBindings.register(outputBinding);

var inputBinding = new Shiny.InputBinding();
$.extend(inputBinding, {
  find: function(scope) {
    return $(scope).find('.d3graph');
  },
  getValue: function(el) {
    return dataset;
  },
  subscribe: function(el, callback) {
    $(el).on("change.inputBinding", function(e) {
      callback();
    });
  },
});
Shiny.inputBindings.register(inputBinding);

function force_wrapper(el, data) {
  //remove the old graph
  //var svg = d3.select(el).select("svg");      
  //svg.remove();
  
	$(el).html("");
	
	var w= 550,
		  h = 400,
      shiftKey;        
    
	var layout = data.layout;
  
  dataset = JSON.parse(data.data_json)
  
  var svg = d3.select(el)
    .attr("tabindex", 1)
    .on("keydown.brush", keydown)
    .on("keyup.brush", keyup)
    .each(function() { this.focus(); })
    .append("svg")
  	  .attr("width", w)
		  .attr("height", h);
      //.attr("style", "float: left;");
  
  var node, link, brush, force, node_back, link_back;
  
  var btn_div  = d3.select(el).append("div")
    .attr("class", "button container");
  
  var btn_clear = btn_div
    .append("input")
      .attr("class", "button control")
      .attr("name", "btn_clear")
      .attr("type", "button")
      .attr("style", "background-image: url(images/clear.png);")        
      .on("click", function(){
        node.classed("selected", false);
        dataset.nodes.forEach(function(d) {d.selected = 0;});
        $(".d3graph").trigger("change");
      }); 
    
  var btn_reset = btn_div
    .append("input")
      .attr("class", "button control")
      .attr("name", "btn_reset")
      .attr("type", "button")
      .attr("style", "background-image: url(images/reset.png);")
      .on("click", function(){ 
        svg.selectAll(".node").remove();
        svg.selectAll(".link").remove();
        svg.selectAll(".brush").remove();
        
        dataset.nodes.forEach(function(d) {
          d.fixed = false;
          d.selected = 0;
        });
        
        init_drawGraph();
        //$(".d3graph").trigger("change");
      }); 
  
  var btn_layout = btn_div
    .append("input")
      .attr("class", "button control")
      .attr("name", "btn_layout")
      .attr("type", "button")
      .attr("style", "background-image: url(images/layout.png);")        
      .on("click", function(){  
        redrawGraph();
        //$(".d3graph").trigger("change");
      });      
  
  init_drawGraph(dataset, layout);
  
  function init_drawGraph() {        
    switch(layout)
    {
      case "force":
        init_forceLayout();
        $(".d3graph").trigger("change");
        break;
      default:
        break;        
    }        
  }  
  
  function redrawGraph() {        
    switch(layout)
    {
      case "force":
        forceLayout();
        $(".d3graph").trigger("change");
        break;
      default:
        break;        
    }        
  }
  
  function forceLayout() {
    
    dataset.nodes.forEach(function(d) {
        if(d.selected == 1) {
          d.fixed = true;
          d.x = d.x;
          d.y = d.y;
          d.px = d.x;
          d.py = d.y; 
        }          
      });
    
    force
      .nodes(dataset.nodes)
      .links(dataset.edges)
      .start();
  
  
    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
      
      node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
    });
  
  }
  
  function init_forceLayout() {
  
    force = d3.layout.force()
      .charge(-120)
      .linkDistance(30)
      .size([w, h]);
      
    force
      .nodes(dataset.nodes)
      .links(dataset.edges)
      .start();
  
    link = svg.append("g").attr("class", "link").selectAll("line.link")
      .data(dataset.edges).enter()
      .append("line")
      .attr("class", "link");
    
    brush = svg.append("g")
      .datum(function() { return {selected: false, previouslySelected: false, group: -1, hidden: false}; })
      .attr("class", "brush")
      .call(d3.svg.brush()
      .x(d3.scale.identity().domain([0, w]))
      .y(d3.scale.identity().domain([0, h]))
      .on("brushstart", function(d) {
        node.each(function(d) { d.previouslySelected = shiftKey && d.selected; });
      })
      .on("brush", function() {
        var extent = d3.event.target.extent();
        node.classed("selected", function(d) {
          return d.selected = d.previouslySelected ^
              (extent[0][0] <= d.x && d.x < extent[1][0]
              && extent[0][1] <= d.y && d.y < extent[1][1]);
        });
      })
      .on("brushend", function() {
        d3.event.target.clear();
        d3.select(this).call(d3.event.target);
        $(".d3graph").trigger("change");
      }));
    
    node = svg.append("g").attr("class", "node").selectAll("circle.node")
      .data(dataset.nodes).enter()
      .append("circle")
      .attr("class","node")
      .attr("r", 4);
      
    node.append("title")
      .text(function(d) { return (typeof d.v_label === "undefined") ? d.id : d.v_label;});
  
    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
      
      node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
    });
    
    node_controls();        
  }
  
  function node_controls() {
    node.on("mousedown", function(d) {
      if (!d.selected) { // Don't deselect on shift-drag.
        if (!shiftKey) node.classed("selected", function(p) { return p.selected = d === p; });
        else d3.select(this).classed("selected", d.selected = true);
      }
    })
    .on("mouseup", function(d) {
      if (d.selected && shiftKey) d3.select(this).classed("selected", d.selected = false);
    })
    .call(force.drag);
    //.call(d3.behavior.drag()
    //  .on("drag", function(d) { nudge(d3.event.dx, d3.event.dy); }));
    
  }    
  
  function nudge(dx, dy) {
    node.filter(function(d) { return d.selected; })
        .attr("cx", function(d) { return d.x += dx; })
        .attr("cy", function(d) { return d.y += dy; })
  
    link.filter(function(d) { return d.source.selected; })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; });
  
    link.filter(function(d) { return d.target.selected; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    
    //d3.event.preventDefault();
  }
  
  function group() {
    var selected = node.filter(function(d) { return d.selected; })
    
    console.log(link);
    
    //add the central node (don't forget to add weight and size later)
    addNode("grp" + group_indx);
    
    //add all the links
    selected.forEach(function(d,i){
      var i = 0;
      while (i < link.length) {
        if (link[i]['source'] == d.id) {
          addLink("grp" + group_indx, link[i]['target'])
          i++;
        } else if(link[i]['target'] == d.id) {
          addLink(link[i]['source'], "grp" + group_indx)
          i++;
        }
        else i++;
      }    
    })
    
    //class nodes for later
    selected
      .each(function(d) {d.group = group_indx;
                        d.hidden = true;
      })
      .attr("group", group_indx)
    
    //store grouped/removed nodes and links for later
    node_back = node;
    link_back = link;
    
    //remove grouped nodes
    selected
      .forEach(function(d){ removeNode(d.id); })
    
    group_indx += 1;
    
    update();
  }
  
  function keydown() {
    if (!d3.event.metaKey) switch (d3.event.keyCode) {
      case 38: nudge( 0, -1); break; // UP
      case 40: nudge( 0, +1); break; // DOWN
      case 37: nudge(-1,  0); break; // LEFT
      case 39: nudge(+1,  0); break; // RIGHT
      case 71: group(); break; //G -- group selected
    }
    shiftKey = d3.event.shiftKey;
  }
  
  function keyup() {
    shiftKey = d3.event.shiftKey;
  }
  
  //helper functions for nodes/links
  function hideNode(id) {
    var i = 0;
    var n = findNode(id);
    while (i < link.length) {
      if ((link[i]['source'] == n)||(link[i]['target'] == n)) {
        link[i].classed("hidden");
        i++;
      }
      else i++;
    }
    node.filter(function(d){ return d.id == findNodeIndex(id)})
      .classed("hidden");
    update();    
  }
  
  function showNode(id) {
    var i = 0;
    var n = findNode(id);
    while (i < link.length) {
      if ((link[i]['source'] == n)||(link[i]['target'] == n)) {
        link[i].classed("hidden", false);
        i++;
      }
      else i++;
    }
    node.filter(function(d){ return d.id == findNodeIndex(id)})
      .classed("hidden", false);
    update();
  }

   // Add and remove elements on the graph object
  function addNode(id) {
      node.push({"id":id});
      update();
  }

  function removeNode(id) {
      var i = 0;
      var n = findNode(id);
      while (i < link.length) {
          if ((link[i]['source'] == n)||(link[i]['target'] == n)) link.splice(i,1);
          else i++;
      }
      node.splice(findNodeIndex(id),1);
      update();
  }

  function addLink(source, target) {
      link.push({"source":findNode(source),"target":findNode(target)});
      update();
  }

  function findNode(id) {
      for (var i in node) {if (node[i]["id"] === id) return node[i]};
  }

  function findNodeIndex(id) {
      for (var i in node) {if (node[i]["id"] === id) return i};
  }


  function update() {
    link.enter().append("line")
        .attr("class", "link");

    link.exit().remove();

    node.enter().append("circle")
        .attr("class", "node")
        .attr("r", 4);

    node.append("title")
      .text(function(d) { return (typeof d.v_label === "undefined") ? d.id : d.v_label;});

    node.exit().remove();
    
    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
      
      node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
    });
    
    node_controls();

    // Restart the force layout.
    force.start();
  }
}

</script>
