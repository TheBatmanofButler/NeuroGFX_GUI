d3.json("graph.json", function(jsonData) {

  // whole canvas initialization
  var width = 960,
      height = 500;
      color = d3.scale.category20c();

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "d3space");

  // left panel initialization
  var initialNodeJSON = {
    "nodes": [
      {"groupNum": 0, "x": 10, "y": 10},
      {"groupNum": 1, "x": 10, "y": 40},
      {"groupNum": 2, "x": 10, "y": 80},
      {"groupNum": 3, "x": 10, "y": 120},
      {"groupNum": 4, "x": 10, "y": 160}],
    "links": []};

  // jsonData["nodes"].push.apply(jsonData["nodes"], initialNodeJSON["nodes"])

  // json objects
  var nodes = initialNodeJSON["nodes"],
      links = initialNodeJSON["links"]

  var node = svg.selectAll(".node");
  var link = svg.selectAll(".link");

  // drag function for panel nodes
  function nodeDrag(d, i) {
    d.x += d3.event.dx
    d.y += d3.event.dy
    d3.select(this).attr("cx", d.x).attr("cy", d.y);
  }

  function createNewPanelNode(d, i) {
    if (d.x == 10) {

      var node = svg.selectAll(".node");

      var replace_x = 10
      var replace_y;
      switch (d.groupNum) {
        case 0:
          replace_y = 10;
          break;
        case 1:
          replace_y = 40;
          break;
        case 2:
          replace_y = 80;
          break;
        case 3:
          replace_y = 120;
          break;
        case 4:
          replace_y = 160;
          break;
        }
      nodes.push({"groupNum": d.groupNum, "x": replace_x, "y": replace_y});
      refresh()
    }
  }

  function deleteNode(d, i) {
    if (d.x < 20) {
      d3.select(this).remove();
      refresh();
    }
  }

  // drag function that is used by panel nodes
  var panelDrag = d3.behavior.drag()
    .on("dragstart", createNewPanelNode)
    .on("drag", nodeDrag)
    .on("dragend", deleteNode);

  function refresh() {

      node = node.data(nodes);

      // add the nodes
      node.enter().append("circle")
          .attr("cx", function(d) {
            return d.x
          })
          .attr("cy", function(d) {
            return d.y
          })
          .attr("r", 5)
          .style("fill", "red")
          .call(panelDrag)

      node.exit().remove();

    // // // add the text 
    // // node.append("text")
    // //     .attr("x", 12)
    // //     .attr("dy", ".35em")
    // //     .text(function(d) { return d.groupNum; });

    link = link.data(links);

    link.enter().insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function(l) {
       var sourceNode = jsonData.nodes.filter(function(d, i) {
         return i == l.source
       })[0];
       d3.select(this).attr("y1", sourceNode.y);
       return sourceNode.x
      })
      .attr("x2", function(l) {
       var targetNode = jsonData.nodes.filter(function(d, i) {
         return i == l.target
       })[0];
       d3.select(this).attr("y2", targetNode.y);
       return targetNode.x
      })
     .attr("fill", "none")
     .attr("stroke", "black");

  }

  refresh()
   
  // action to take on mouse click
  function click() {
      // d3.select(this).select("text").transition()
      //     .duration(750)
      //     .attr("x", 22)
      //     .style("stroke", "lightsteelblue")
      //     .style("stroke-width", ".5px")
      //     .style("font", "20px sans-serif");
  }
});