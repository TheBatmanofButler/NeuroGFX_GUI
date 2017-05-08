d3.json("graph.json", function(jsonData) {

  // whole canvas initialization
  var width = window.innerWidth,
      height = window.innerHeight,
      resolution = 20,
      color = d3.scale.category20c();

  var deleteMode = false;

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "d3space")
      .on("mousemove", mousemove)
      .on("click", invisible_click);

  svg.append("image")
      .attr("xlink:href","trash.svg")
      .attr("x", 10)
      .attr("y", 300)
      .attr("width", 50)
      .on("click", function() {

        deleteMode = !deleteMode;
        if (deleteMode) {
          d3.select(this).attr("xlink:href","delete.svg");
          node.on("click", function(d, i) {
            for (var ind in links) {
              var l = links[ind];
              console.log(l);
              if (l.source == i || l.target == i) {
                console.log(l);
                d3.select(link[0][ind]).remove();

              }
            }
            d3.select(this).remove();
          });
          link.on("click", function(d, i) {
              d3.select(this).remove();
          });
        }
        else {
          d3.select(this).attr("xlink:href","trash.svg");
          node.on("click", function() {});
        }
      });

  svg.append("image")
      .attr("xlink:href","save.svg")
      .attr("x", 10)
      .attr("y", 400)
      .attr("width", 50)
      .on("click", function() {
        var a = document.createElement("a");
        var file = new Blob([JSON.stringify({"nodes": nodes, "links": links})], {type: 'text/plain'});
        a.href = URL.createObjectURL(file);
        a.download = 'diagram.txt';
        a.click();
      });

  svg.append("image")
      .attr("xlink:href","upload.svg")
      .attr("x", 10)
      .attr("y", 500)
      .attr("width", 50)
      .on("click", function() {
          // var $inp = $('<input style="display: none" type="file">');
          // $("body").append($inp);
          // $inp.trigger("click");
          // console.log($inp);
      });

  var vertical = svg.selectAll('.vertical')
      .data(d3.range(1, width / resolution))
      .enter().append('line')
      .attr('class', 'vertical')
      .attr('x1', function(d) { return d * resolution; })
      .attr('y1', 0)
      .attr('x2', function(d) { return d * resolution; })
      .attr('y2', height);

  var horizontal = svg.selectAll('.horizontal')
      .data(d3.range(1, height / resolution))
      .enter().append('line')
      .attr('class', 'horizontal')
      .attr('x1', 0)
      .attr('y1', function(d) { return d * resolution; })
      .attr('x2', width)
      .attr('y2', function(d) { return d * resolution; });

  // left panel initialization
  var initialNodeJSON = {
    "nodes": [
      {"labelType": "small", "rectText": "", "x": 10, "y": 10},
      {"labelType": "large", "rectText": "", "x": 10, "y": 100}],
    "links": []};

  jsonData["nodes"].push.apply(jsonData["nodes"], initialNodeJSON["nodes"])

  var invisible_node = 0;
  var invisible_node_ind, source_node, noclick;

  // json objects
  var nodes = jsonData["nodes"],
      links = jsonData["links"];

  // var node = svg.selectAll(".node");
  var link = svg.selectAll(".link");
  var node = svg.selectAll("g.gnode");
  var labels;

  // drag function for panel nodes
  function nodeDrag(d, i) {
    var x = d3.event.x
    var y = d3.event.y

    vertical.style("stroke", "gray");
    horizontal.style("stroke", "gray");

    var xGrid, yGrid;
    var modX = x % resolution
    if (modX >= 3) {
      xGrid = x + (resolution - modX)
    }
    else {
      xGrid = x - modX
    }
    
    var modY = y % resolution
    if (modY >= 3) {
      yGrid = y + (resolution - modY)
    }
    else {
      yGrid = y - modY
    }

    d3.select(this).attr("x", xGrid).attr("y", yGrid);
    nodes[i].x = xGrid;
    nodes[i].y = yGrid;
    // console.log(d3.select(this));

    link.each(function(l, li) {
      if (l.source == i) {
        d3.select(this).attr("x1", xGrid).attr("y1", yGrid);
      } else if (l.target == i) {
        d3.select(this).attr("x2", xGrid).attr("y2", yGrid);
      }
    });

    for (var ind in labels[0]) {
      if (ind != "parentNode" && labels[0][ind].textContent == d.rectText)  {
      d3.select(labels[0][ind]).attr("x", xGrid)
                               .attr("y", yGrid);
      }
    }
  }

  function createNewPanelNode(d, i) {
    console.log(d);
    if (d.x == 10) {
      var replace_x = 10;
      var replace_y;
      if (d.labelType == "small") {
          replace_y = 10;
      }
      else {
          replace_y = 100;
      }
      nodes.push({"labelType": d.labelType, "rectText": "", "x": replace_x, "y": replace_y});
      
      var newnode = svg
       .append('g')
       .classed('gnode', true)

      newnode.append("rect")
      .attr("x", replace_x)
      .attr("y", replace_y)
      .attr("width", 20)
      .attr("height", function() {
        if (d.labelType == "small") {
          return 40;
        }
        else if (d.labelType == "large") {
          return 60;
        }
        else {
          return 20;
        }
      })
      .style("fill", function() {
        if (d.labelType == "invisible") {
          return "blue";
        }
        else {
          return "red";
        }
      })
      .call(panelDrag)
      .on("dblclick", singleClick)
      .on("contextmenu", addLabel);
      // refresh();
    }
  }

  function deleteNode(d, i) {

    if (!invisible_node) {
      vertical.style("stroke", "white");
      horizontal.style("stroke", "white");
    }

    if (this.x.baseVal.value < 20) {
      d3.select(this).remove();
      // refresh();
    }
  }

  // drag function that is used by panel nodes
  var panelDrag = d3.behavior.drag()
    .on("dragstart", createNewPanelNode)
    .on("drag", nodeDrag)
    .on("dragend", deleteNode);

  function refreshLinks() {
    link = link.data(links);

    link.enter().insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function(l) {
       var sourceNode = nodes.filter(function(d, i) {
         return i == l.source
       })[0];
       d3.select(this).attr("y1", sourceNode.y);
       return sourceNode.x
      })
      .attr("x2", function(l) {
       var targetNode = nodes.filter(function(d, i) {
         return i == l.target
       })[0];
       d3.select(this).attr("y2", targetNode.y);
       return targetNode.x
      })
     .style("fill", "none")
     .style("stroke", "black")
  }

  function refresh() {

    link = link.data(links);

    link.enter().insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function(l) {
       var sourceNode = nodes.filter(function(d, i) {
         return i == l.source
       })[0];
       d3.select(this).attr("y1", sourceNode.y);
       return sourceNode.x
      })
      .attr("x2", function(l) {
       var targetNode = nodes.filter(function(d, i) {
         return i == l.target
       })[0];
       d3.select(this).attr("y2", targetNode.y);
       return targetNode.x
      })
     .style("fill", "none")
     .style("stroke", "black")

    node = node.data(nodes);

    node
       .enter()
       .append('g')
       .classed('gnode', true);

    // add the nodes
    node.append("rect")
      .attr("x", function(d) {
        return d.x
      })
      .attr("y", function(d) {
        return d.y
      })
      .attr("width", 20)
      .attr("height", function(d) {
        if (d.labelType == "small") {
          return 40;
        }
        else if (d.labelType == "large") {
          return 60;
        }
        else {
          return 20;
        }
      })
      .style("fill", function(d) {
        if (d.labelType == "invisible") {
          return "blue";
        }
        else {
          return "red";
        }
      })
      .call(panelDrag)
      .on("dblclick", singleClick)
      .on("contextmenu", addLabel);

    labels = node
      .append("text")
      .text(function (d, i) { return d.rectText; })
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y;
      })
      .style("text-anchor", "middle")
      .style("fill", "#555")
      .style("font-family", "Arial")
      .style("font-size", 12)

    node.exit().remove();


    vertical.style("stroke", "white");
    horizontal.style("stroke", "white");
  }

  refresh()
   
  // action to take on mouse click
  function singleClick(d, i) {
    console.log(3);
    invisible_node_ind = nodes.push({"labelType": "invisible", "rectText": "", x: d.x, y: d.y}) - 1;
    invisible_link_ind = links.push({"source": i, "target": invisible_node_ind}) - 1;
    refreshLinks();

    // refresh();
    var newnode = svg
       .append('g')
       .classed('gnode', true)

    newnode.append("rect")
      .attr("x", d.x) 
      .attr("y", d.y)
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", "blue")
      .on("click", invisible_click)
      .on("contextmenu", addLabel);

    invisible_node = newnode.select("rect")[0][0];
    source_node = d;
    source_node_ind = i;
    invisible_link = link[0][invisible_link_ind];

    vertical.style("stroke", "gray");
    horizontal.style("stroke", "gray");

    d3.select(invisible_node).on("click", invisible_click);
  }

  function mousemove() {
    console.log(2);
    if (invisible_node) {
      var coords = d3.mouse(d3.select('body').node());

      var x_val = coords[0];
      var xGrid, yGrid;

      d3.select(invisible_node)
      .attr("y", function(d, i) {
          if (Math.abs(x_val - source_node.x) < 10) {
            // console.log(x_val);

            var modX = source_node.x % resolution
            if (modX >= 3) {
              xGrid = source_node.x + (resolution - modX)
            }
            else {
              xGrid = source_node.x - modX
            }
            
            var modY = coords[1] % resolution
            if (modY >= 3) {
              yGrid = coords[1] + (resolution - modY)
            }
            else {
              yGrid = coords[1] - modY
            }

            d3.select(invisible_node).attr("x", xGrid);
            return yGrid;
          }
          else {
            // console.log(2);

            var modX = coords[0] % resolution
            if (modX >= 3) {
              xGrid = coords[0] + (resolution - modX)
            }
            else {
              xGrid = coords[0] - modX
            }
            
            var modY = source_node.y % resolution
            if (modY >= 3) {
              yGrid = source_node.y + (resolution - modY)
            }
            else {
              yGrid = source_node.y - modY
            }

            d3.select(invisible_node).attr("x", xGrid);
            return yGrid;
          }
      })

      d3.select(invisible_link)
      .attr("x1", source_node.x)
      .attr("y1", source_node.y)
      .attr("x2", invisible_node.x.baseVal.value)
      .attr("y2", invisible_node.y.baseVal.value)
      .style("fill", "none")
      .style("stroke", "black");
    }
  }

  function invisible_click(d, i) {
    console.log(1)
    // console.log(d3.select(this)[0][0].x.baseVal.value, d3.select(invisible_node)[0][0].x.baseVal.value)
    if (invisible_node) {
      d3.select(invisible_node)
        .attr("x", function(d, i) {
            var set_x = invisible_node.x.baseVal.value;
            nodes[invisible_node_ind].x = set_x;
            return set_x;
        })
        .attr("y", function(d, i) {
            var set_y = invisible_node.y.baseVal.value;
            nodes[invisible_node_ind].y = set_y;
            return set_y;
        });

        var done = false;

        for (var ind in nodes) {
          var n = nodes[ind];
          var x_check = invisible_node.x.baseVal.value - n.x;
          var y_check = invisible_node.y.baseVal.value - n.y;
          var w = 25;
          if (nodes[ind].labelType == "small") {
            var h = 40;
          }
          else if (nodes[ind].labelType == "large") {
            var h = 60;
          }

          if (n.labelType != "invisible" && invisible_node.x.baseVal.value == n.x && y_check <= h && y_check >= 0) {
            console.log("@33333");
            for (var ind2 in nodes) {
              var n2 = nodes[ind2];
              if (n2.labelType == "invisible") {
                d3.select(svg.selectAll("rect")[0][ind2]).style("fill", "none");
              }
            }
            invisible_node = 0;
            // var g = links.pop();
            // console.log(g);
            d3.select(invisible_link).remove();
            links.push({"source": ind, "target": source_node_ind})
            refreshLinks()
            // refresh();
            done = true;
            vertical.style("stroke", "white");
            horizontal.style("stroke", "white");
            break;
          }
        }

        if (!done) {
          singleClick(nodes[invisible_node_ind], invisible_node_ind);
        }

    }
  };

  function addLabel(d, i) {
    d3.event.preventDefault();
    if (d.x != 10) {
      var newlabel = prompt("Label text:", "");
      nodes[i].rectText = newlabel;
      labels[0][i].textContent = newlabel;
      console.log(labels[0][i].textContent);
      // nodes.push({"labelType": d.labelType, "rectText": "", "x": replace_x, "y": replace_y});
      // refresh();
    }
  }

});