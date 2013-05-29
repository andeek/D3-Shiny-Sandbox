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
    wrapper(el, data);
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

function wrapper(el, data) {  
  var w = 550,
      h = 400,
      root,
      node,
      link;

  var force = d3.layout.force()
      .on("tick", tick)
      .linkDistance(80)
      .charge(-120)
      .gravity(.05)
      .size([w, h]);
      
  d3.select(el).select("svg").remove();
  var svg = d3.select(el)
      .append("svg")
      .attr("width", w)
      .attr("height", h);
  
  root = JSON.parse(data.data_json);
  //create copy of original data just in case?
  dataset = root;
  
  //setup each nodes with count 1 and store "group" value to be changed later
  root.nodes.forEach(function(d) { d.count = 1; d.group = d.v_value});
    
  update();
    
  function update() {    
    var dataset_condense = condense(root)
    console.log(dataset_condense.nodes);
    console.log(dataset_condense.nodes.length);
    var nodes = dataset_condense.nodes,
        links = dataset_condense.links;
    
    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .linkDistance(30*dataset_condense.nodes.length/5)
        .start();
  
    // Update the links…
    link = svg.selectAll("line.link")
        .data(links, function(d) { return d.target.id; });
  
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
        .data(nodes, function(d) { return d.id; })
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
    return d._count ? "#3182bd" : d.count ? "#c6dbef" : "#fd8d3c";
  }
  
  // Toggle children on click.
  function click(d) {
    toggle(d);
    update();
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
        links = [],
        i = 0;
        
    //first group all the necessary nodes, then worry about links
    var nodes_indx = 0;
    root.nodes.forEach(function(d) {      
      var test = 0;
      nodes.forEach(function(g) { if(d.v_id == g.id) test+=1; });
      if(test == 0) {        
        if(d._count) {
          nodes.push({id: d.id, index: nodes_indx, _count: d._count});
          nodes_indx += 1;
        } else {
          //if count not _count, condense if possible
          //need to grab all nodes with same group as d
          var root_n = root.nodes.filter(function(v) { return v.group == d.group;});  
          
          //avoid duplicates
          //root_n.forEach(function(e) { toggle(e); });
            
          //create hierarchy on group
          var nodes_hier = d3.nest()
            .key(function(e) { return e.group; }).sortKeys(d3.ascending)
            .entries(root_n);
          
          //create rollup of count on group
          var nodes_hier_count = d3.nest()
            .key(function(e) { return e.group; }).sortKeys(d3.ascending)
            .rollup(function(e) { return e.length; })
            .entries(root_n);
  
          nodes_hier_count.forEach( function(e) {
            test = 0;
            nodes.forEach(function(g) { if(e.key == g.id) test+=1; });
            if(test == 0) { 
              nodes.push({id: e.key, index: nodes_indx, count: e.values}); 
              nodes_indx += 1; 
            }
          });
        }
      }      
      //set all to _count
      nodes.forEach(function(e) { if(e.count) {e._count = e.count; e.count = null;} });
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
      e.values.forEach( function(f) {
        var test = 0;
        links.forEach(function(g) { if(e.key == g.target && f.key == g.source) test+=1; });
        if(test == 0 && f.key != e.key) {
          links.push({
            source: nodes.filter(function(v) { return v.id == e.key;})[0].index,
            target: nodes.filter(function(v) { return v.id == f.key;})[0].index    
          });
        }        
      })
    }); 

    console.log(nodes);
    console.log(links);
    
    return {nodes: nodes, links: links};
  }
  
  // Returns a list of all nodes under the root.
  function flatten(root) {
    var nodes = [], i = 0;
  
    function recurse(node) {
      if (node.count) node.count.forEach(recurse);
      if (!node.id) node.id = ++i;
      nodes.push(node);
    }
  
    recurse(root);
    return nodes;
  }
  
}
</script>
