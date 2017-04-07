graphData = {"nodes":
  [{"name":"Myriel"},
  {"name":"Napoleon"},
  {"name":"Mlle.Baptistine"},
  {"name":"Mme.Magloire"},
  {"name":"CountessdeLo"},
  {"name":"Geborand"},
  {"name":"Champtercier"},
  {"name":"Cravatte"},
  {"name":"Count"},
  {"name":"OldMan"},
  {"name":"Labarre"},
  {"name":"Valjean"},
  {"name":"Marguerite"},
  {"name":"Mme.deR"},
  {"name":"Isabeau"},
  {"name":"Gervais"}],
"links":
[{"source":1,"target":0}]
}

var w = 960,
    h = 500

var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

// d3.json("graph.json", function(graphData) {
  console.log(graphData)
    // drag behavior
    var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

    function dragstart(d, i) {
        // force.stop() // stops the force auto positioning before you start dragging
        console.log(force)
        graphData.links.push({"source": 2, "target": 3})
        refresh();
    }

    function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy; 
        tick(); // this is the key to make it work together with updating both px,py,x,y on d !
    }

    function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        tick();
        // force.resume();
    }

    var force = self.force = d3.layout.force()
        .nodes(graphData.nodes)
        .links(graphData.links)
        .gravity(.05)
        .distance(100)
    .linkDistance(60)
    .charge(-300)
        .size([w, h])
        .start();

    var link = svg.selectAll("line.link")
        .data(graphData.links)
        .enter().append("svg:line")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    var node = svg.selectAll("g.node")
        .data(graphData.nodes)
      .enter()
      .append("svg:g")
        .attr("class", "node")
        .call(node_drag);

    node.append("circle")
        .attr("class", "circle")
        .attr("x", "-8px")
        .attr("y", "-8px")
      .attr("r", 3)
      .style("fill", "red")

    node.append("svg:text")
        .attr("class", "nodetext")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name });

    force.on("tick", tick);

    function tick() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    };

    function refresh() {

        // svg.selectAll("*").remove();

        console.log(svg)

        force
        .nodes(graphData.nodes)
        .links(graphData.links)
        .gravity(.05)
        .distance(100)
        // .charge(-300)
        .size([w, h])
        .start();

        link
        .data(graphData.links)
        .enter().append("svg:line")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

        node
        .data(graphData.nodes)
      .enter()
      .append("svg:g")
        .attr("class", "node")
        .call(node_drag);

    node.append("circle")
        .attr("class", "circle")
        .attr("x", "-8px")
        .attr("y", "-8px")
      .attr("r", 3)
      .style("fill", "red")

    node.append("svg:text")
        .attr("class", "nodetext")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name });

    force.on("tick", tick);

    }


// });