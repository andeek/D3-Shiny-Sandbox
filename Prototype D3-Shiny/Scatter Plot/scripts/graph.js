<style>
svg .axis path,
svg .axis line {
    fill: none;
    stroke: black;
    shape-rendering: crispEdges;
}

svg .axis text {
    font-family: sans-serif;
    font-size: 11px;
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
		
    var colors = ["#d81417", "#2a9c3b", "#0d4cd6", "#000000"];
    
		var p = 50,
			w = 600-p;
			h = 500-p;
		
		var b = 5;
		
		var values = [];		
		var names = [];
		
		names[0] = data.names[0];
		names[1] = data.names[1];
		
		for (var inc=0; inc<data.df.x.length; inc++)  {
			values.push([data.df.x[inc], data.df.y[inc]]);
		} 

		var x_extent = d3.extent(values, function(d) {return d[0]});
		var y_extent = d3.extent(values, function(d) {return d[1]});
		
		var xscale = d3.scale.linear()
                     .range([p, w - p])
                     .domain(x_extent)
		
		var yscale = d3.scale.linear()
                     .range([h - p, p])
                     .domain(y_extent)

		//append a new one
		svg = d3.select(el).append("svg")      
		  .attr("width", w + p)
		  .attr("height", h + p);
		
		var circle = svg.selectAll("circle")
						.data(values)
						.enter()
						.append("circle")
            .attr("fill", "#000000")
						.attr("cx", function(d){return xscale(d[0]);})
						.attr("cy", function(d){return yscale(d[1]);})
						.attr("r", 5); 
		
		var xaxis = d3.svg.axis()
					.scale(xscale)
					.ticks(5)
					.orient("bottom");

		var yaxis = d3.svg.axis()
					.scale(yscale)
					.ticks(5)
					.orient("left");  
					
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (h - p) + ")")
			.call(xaxis);
		
		svg.append("g")
			.attr("class","y axis")
			.attr("transform", "translate(" + p + ",0)")
			.call(yaxis); 
		
		d3.select(".x.axis")
			.append("text")
			.text(names[0])
			.attr("x", w/2)
			.attr("y", p/1.5);
			
		d3.select(".y.axis")
			.append("text")
			.text(names[1])
			.attr("transform", "rotate(-90, -43, 0) translate(" + -(h+p)/2  + ")")
			
		svg.selectAll("circle")
			.on("mouseover", function(d){
				d3.select(this)
					.transition()
					.attr("r", 9);
			})
			.on("mouseout", function(d){
				d3.select(this)
					.transition()
					.attr("r", 5);
			})
      .on("click", function(d){
        d3.select(this)
          .transition()
          .duration(100)
          .attr("fill", function(d){
            var currentcolor = this.getAttribute("fill");
            for(var c=0;c<colors.length; c++){
              if(currentcolor == colors[c]){
                 return colors[(c+1)%colors.length];                 
              }} 
          })
      });
				
			
				
    }
  });
  Shiny.outputBindings.register(outputBinding, 'andeek.binding');
  
  </script>
