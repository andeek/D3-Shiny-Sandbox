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
      link,
      nodes_hier;
  
  var force = d3.layout.force()
    .on("tick", tick)
    .linkDistance(30)
    .charge(-120)
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
  root.nodes.forEach(function(d) { d.count = 1; d.group = d.v_value; d.index = d.v_id});
  
  //create record of nodes in group
  nodes_hier = d3.nest()
    .key(function(e) { return e.group; }).sortKeys(d3.ascending)       
    .entries(root.nodes);
  
  update();
  
  function update() {    
    var dataset_condense = condense(root);
    
    var nodes = dataset_condense.nodes,
        links = dataset_condense.links;
    
    
    console.log(links);
    console.log(nodes);
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
    
    node.append("title")
      .text(function(d) { return (typeof d.v_label === "undefined") ? d.id : d.v_label;});
    
    // Exit any old nodes.
    node.exit().remove();
    
    console.log(link);
    console.log(node);
    
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
    var tempy = [],
        nodes = [],
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
          nodes.push({_count: e.values.length, group:e.key, id: e.key, index: nodes.length, v_label: label, rollednodes: e.values.nodes});                        
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
          tempy.push({source: parseInt(s), target: parseInt(t)});
        }        
      })
    });
    console.log(tempy);
    return {links: links, nodes: nodes};
  }
  
}
</script>
  