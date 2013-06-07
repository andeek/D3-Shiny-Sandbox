<style type="text/css"> 
circle.node {
  cursor: pointer;
  stroke: #3182bd;
  stroke-width: 1.5px;
}

line.link {
  fill: none;
  stroke: #9ecae1;
  stroke-width: 1.5px;
}

circle.node.selected {
  stroke: red;
}

.brush .extent {
  fill-opacity: .1;
  stroke: #fff;
  shape-rendering: crispEdges;
}
</style>
  <script src="http://d3js.org/d3.v3.js"></script>
  <script type="text/javascript">
  
var dataset_condense;
var group_indx = 0;

var outputBinding = new Shiny.OutputBinding();
$.extend(outputBinding, {
  find: function(scope) {
    return $(scope).find('.d3graph');
  },
  renderValue: function(el, data) {  
    wrapper(el, data);
  }});
Shiny.outputBindings.register(outputBinding);

var inputBinding = new Shiny.InputBinding();
$.extend(inputBinding, {
  find: function(scope) {
    return $(scope).find('.d3graph');
  },
  getValue: function(el) {
    return dataset_condense;
  },
  subscribe: function(el, callback) {
    $(el).on("change.inputBinding", function(e) {
      callback();
    });
  },
});
Shiny.inputBindings.register(inputBinding);

function wrapper(el, data) {  
  var w = 550,
      h = 400,
      root,
      node,
      link,
      brush,
      nodes_hier,
      shiftkey = false;
 
  var force = d3.layout.force()
    .on("tick", tick)
    .linkDistance(30)
    .charge(-120)
    .size([w, h]);
  
  d3.select(el).select("svg").remove();
  var svg = d3.select(el)
    .attr("tabindex", 1)
    .on("keydown.brush", keydown)
    .on("keyup.brush", keyup)
    .each(function() { this.focus(); })
    .append("svg")
    .attr("width", w)
    .attr("height", h);
  
    // Add brushing functionality.
    brush = svg.append("g")
      .datum(function() { return {selected: false, previouslySelected: false}; })
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
  
  root = JSON.parse(data.data_json);
  
  //setup each nodes with count 1 and store "group" value to be changed later
  root.nodes.forEach(function(d) { d.count = 1; d.group = d.v_value; d.index = d.v_id; d.selected=0;});
  
  //create record of nodes in group
  nodes_hier = d3.nest()
    .key(function(e) { return e.group; }).sortKeys(d3.ascending)       
    .entries(root.nodes);
  
  update();
  
  function update() {    
    dataset_condense = condense(root);
    
    var nodes = dataset_condense.nodes,
        links = dataset_condense.links;

    // Restart the force layout.
    force
      .nodes(nodes)
      .links(links)
      .start();
    
    // Update the links…
    link = svg.selectAll("line.link")
        .data(links, function(d) { return d.source.id + "-" + d.target.id; });
    
    // Enter any new links.
    link.enter().insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
    
    // Exit any old links.
    link.exit().remove();
    
    // Update the nodes…
    node = svg.selectAll("circle.node")
      .data(nodes, function(d){ return d.id; })
      .style("fill", color);
    
    // Enter any new nodes.
    node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d._count; })
      .style("fill", color)
      .on("click", click)
      .call(force.drag);
    
    // Exit any old nodes.
    node.exit().remove();
    
    node.append("title")
      .text(function(d) { return (typeof d.v_label === "undefined") ? d.id : d.v_label;});
    
    $(".d3graph").trigger("change");
    console.log(dataset_condense);
  }
  
  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });
    
    node.attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
  }
  
  // Color leaf nodes orange, and packages white or blue.
  function color(d) {
    return (d._count > 1) ?  "#c6dbef" :"#3182bd";
  }
  
  // Toggle children on click.
  function click(d) {
    toggle(d);
    toggle_group(d); 
    
    //set all nodes to count so they can be reconsidered by update
    root.nodes.forEach(function(e){ 
      if (e._count) {
        e.count = e._count;
        e._count = null;
      }
    });
    update();
  }
  
  function toggle_group(d) {
    if(d.count > 1) {
      //if node count > 1, set all nodes in group clicked to own group
      root.nodes.forEach(function(e) {
        if(d.rollednodes.indexOf(e.id) > -1) {
          e.group = e.id;
        }
      });
    }
    else {
      //if node count = 1, set all nodes in that original group to have group
      var root_n = root.nodes.filter(function(v) { return v.group == d.group;});
      
      var group = -1,
      ids = [];
      
      //grab the group
      nodes_hier.forEach(function(e) {
        //traverse groups
        e.values.forEach(function(f) {
          //traverse nodes within groups
          if(f.id == d.id) {
            group = e.key;
          }
        });      
      });
      
      //grab the node ids in the group
      nodes_hier.forEach(function(e){
        if(e.key == group) {
          e.values.forEach(function(f){
            ids.push(f.id);
          });  
        }
      });
      
      //store group for each element
      root.nodes.forEach(function(e){
        if(ids.indexOf(e.id) > -1) {
          e.group = group;
        }
      });
    }
  }
  
  function toggle(d) {
    if (d.count) {
      d._count = d.count;
      d.count = null;
    } else {
      d.count = d._count;
      d._count = null;
    }
  }
  
  function condense(root) {
    var nodes = [],
        links = [];
    
    //first group all the necessary nodes, then worry about links
    root.nodes.forEach(function(d) {      
      if(d.count) {
        //if count not _count = 1, group
        
        //need to grab all nodes with same group as d
        var root_n = root.nodes.filter(function(v) { return v.group == d.group;});  
        
        //avoid duplicates
        root_n.forEach(function(e) { toggle(e); });
        
        //create rollup of count on group
        var temp = [];
        var nodes_hier_count = d3.nest()
        .key(function(e) { return e.group; }).sortKeys(d3.ascending)
        .rollup(function(e) {
          e.forEach(function(a){ temp.push(a.id);});
          return {length: e.length, nodes: temp}; 
        })          
        .entries(root_n);
        
        nodes_hier_count.forEach( function(e) { 
          var label = (e.values.length == 1) ? d.v_label : "Group "+e.key;
          nodes.push({_count: e.values.length, group:e.key, id: e.key, index: nodes.length, v_label: label, rollednodes: e.values.nodes, selected: 0});                        
        });
      }
      
    });
    var root_e = root.edges;
    
    root_e.forEach(function(f) {
      f.source_grp = root.nodes[f.source].group;
      f.target_grp = root.nodes[f.target].group;
    });  
    
    //rollup # target within source (use for weighting, but how?)
    var edges_hier = d3.nest()
    .key(function(e) { return e.source_grp; }).sortKeys(d3.ascending)
    .key(function(e) { return e.target_grp; }).sortKeys(d3.ascending)
    .rollup(function(e) {
      return {
        length:e.length
      };
    })
    .entries(root_e);
    
    edges_hier.forEach( function(e) {
      //e sources
      e.values.forEach( function(f) {        
        //f targets
        var test = 0;
        links.forEach(function(g) { if(e.key == g.target && f.key == g.source) test+=1; });
        if(test == 0 && f.key != e.key) {
          var s = nodes.filter(function(v) { return v.id == e.key;})[0].index.toString(),
          t = nodes.filter(function(v) { return v.id == f.key;})[0].index.toString();
          links.push({source: parseInt(s), target: parseInt(t)});
        }        
      })
    });
    return {nodes: nodes, links: links};
  }
  
  function keydown() {
    shiftKey = d3.event.shiftKey;
  }
  
  function keyup() {
    shiftKey = d3.event.shiftKey;
  }
  
}
</script>
  