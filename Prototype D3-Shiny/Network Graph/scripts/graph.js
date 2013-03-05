<style>
.node {
  stroke: #fff;
  stroke-width: 1.5px;
}

.node .selected {
  stroke: red;
}

.link {
  stroke: #999;
}

.brush .extent {
  fill-opacity: .1;
  stroke: #fff;
  shape-rendering: crispEdges;
}
</style>
<script src="http://d3js.org/d3.v3.js"></script>
<script type="text/javascript">

var outputBinding = new Shiny.OutputBinding();
  $.extend(outputBinding, {
    find: function(scope) {
      return $(scope).find('.shiny-graph-output');
    },
    renderValue: function(el, data) {  	
		//remove the old graph
		var svg = d3.select(el).select("svg");      
		svg.remove();
		
		$(el).html("");
		
		var w= 700,
			  h = 400,
        shiftKey;        
      
		var layout = data.layout;
    
    var dataset = JSON.parse(data.data_json)
    
    var svg = d3.select(el)
      .attr("tabindex", 1)
      .on("keydown.brush", keydown)
      .on("keyup.brush", keyup)
      .each(function() { this.focus(); })
      .append("svg")
  		  .attr("width", w)
  		  .attr("height", h);
    
    var node, link;

    drawGraph(dataset, layout)
    function drawGraph(ds, l) {        
      switch(l)
      {
        case "force":
          forceLayout(ds);
          break;
        default:
          break;        
      }        
    }  
    
    function forceLayout(ds) {
      
      var force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)
        .size([w, h]);
        
      force
        .nodes(ds.nodes)
        .links(ds.edges)
        .start();

      link = svg.append("g")
        .attr("class", "link")
        .selectAll("line.link")        
        .data(ds.edges).enter()
        .append("line")
        .attr("class", "link");
      console.log(ds.edges);
      console.log(ds.nodes);
      console.log(link);
      
      var brush = svg.append("g")
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
        }));
      
      node = svg.append("g")
        .attr("class", "node")
        .selectAll("circle.node")
        .data(ds.nodes).enter()
        .append("circle")
        .attr("class","node")
        .attr("r", 4);
      
      console.log(node);
        
      force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
        
        node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
      });
      
      node.on("mousedown", function(d) {
        if (!d.selected) { // Don't deselect on shift-drag.
          if (!shiftKey) node.classed("selected", function(p) { return p.selected = d === p; });
          else d3.select(this).classed("selected", d.selected = true);
        }
      })
      .on("mouseup", function(d) {
        if (d.selected && shiftKey) d3.select(this).classed("selected", d.selected = false);
      })
      .call(d3.behavior.drag()
        .on("drag", function(d) { nudge(d3.event.dx, d3.event.dy, node, link); }));
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
    
      d3.event.preventDefault();
    }
    
    function keydown() {
      if (!d3.event.metaKey) switch (d3.event.keyCode) {
        case 38: nudge( 0, -1); break; // UP
        case 40: nudge( 0, +1); break; // DOWN
        case 37: nudge(-1,  0); break; // LEFT
        case 39: nudge(+1,  0); break; // RIGHT
      }
      shiftKey = d3.event.shiftKey;
  }
  
  function keyup() {
    shiftKey = d3.event.shiftKey;
  }
    
    
    }});
  Shiny.outputBindings.register(outputBinding, 'andeek.binding');
  
  </script>
