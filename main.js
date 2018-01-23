var graphJSONpath;

$( document ).ready(function() {
  graphJSONpath = "graph.json";
  loadCanvas();
});

function loadCanvas() {
  d3.json(graphJSONpath, function(jsonData) {

    // whole canvas initialization
    var width = window.innerWidth,
        height = window.innerHeight,
        resolution = 10,
        color = d3.scale.category20c();

    var deleteMode = false;
    var colorMode = false;

    var canv = d3.select("canvas").attr("width", width)
        .attr("height", height);

    var svg = d3.select("#svg").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "d3space")
        .on("mousemove", mousemove)
        .on("click", invisible_click);

    svg.append("image")
        .attr("xlink:href","trash.svg")
        .attr("x", 10)
        .attr("y", 300)
        .attr("width", 30)
        .on("click", function() {

          deleteMode = !deleteMode;
          if (deleteMode) {
            d3.select(this).attr("xlink:href","delete.svg");
            node.on('mousedown.drag', null);
            node.on("click", function(d, i) {
              console.log(d3.select(this).attr("x"))
              if (d.x != 10) {
                for (var ind in links) {
                  var l = links[ind];
                  if (l.source == i || l.target == i) {
                    d3.select(link[0][ind]).remove();
                    links.splice(ind, 1);
                  }
                }

                d3.select(this).remove();

                for (var k in nodes_copy) {
                  if (nodes_copy[k].x == d3.select(this).attr("x") &&
                      nodes_copy[k].y == d3.select(this).attr("y")) {
                    console.log(k);
                    nodes_copy.splice(k, 1);
                  }
                }

                console.log(nodes);
                refresh()
              }
            });
            link.on("click", function(d, i) {
                d3.select(this).remove();
                links.splice(i, 1);
            });
          }
          else {
            console.log(213);
            d3.select(this).attr("xlink:href","trash.svg");
            node.on("click", null);
            node
              .call(panelDrag)
              .on("dblclick", doubleClick);
            link.on("click", null);
          }
        });

    svg.append("image")
        .attr("xlink:href","jsonSave.svg")
        .attr("x", 10)
        .attr("y", 350)
        .attr("width", 30)
        .on("click", function() {
          var savableJSON = {
            "nodes": [],
            "links": links};

          for (var j in nodes_copy) {
            console.log(j);
            if (nodes_copy[j].x != 10) {
              savableJSON["nodes"].push(nodes_copy[j]);
            }
          }

          var a = document.createElement("a");
          var file = new Blob([JSON.stringify({"nodes": savableJSON["nodes"], "links": links})], {type: 'text/plain'});
          a.href = URL.createObjectURL(file);
          a.download = 'diagram.json';
          a.click();
        });

    svg.append("image")
        .attr("xlink:href","save.svg")
        .attr("x", 10)
        .attr("y", 400)
        .attr("width", 30)
        .on("click", function() {

        // save functionality adopted from http://techslides.com/save-svg-as-an-image

        var filename = prompt("Image name (will save as png automatically): ", "");

        var html = d3.select("svg")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

        //console.log(html);
        var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
        var img = '<img src="'+imgsrc+'">'; 
        d3.select("#svgdataurl").html(img);

        var canvas = document.querySelector("canvas"),
            context = canvas.getContext("2d");

        var image = new Image;
        image.src = imgsrc;
        image.onload = function() {
          context.drawImage(image, 0, 0);

          //save and serve it as an actual filename
          binaryblob();

          var a = document.createElement("a");
          a.download = filename + ".png";
          a.href = canvas.toDataURL("image/png");

           var pngimg = '<img src="'+a.href+'">'; 
             d3.select("#pngdataurl").html(pngimg);

          a.click();
        };
    });

    function binaryblob(){
      var byteString = atob(document.querySelector("canvas").toDataURL().replace(/^data:image\/(png|jpg);base64,/, "")); //wtf is atob?? https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        var dataView = new DataView(ab);
      var blob = new Blob([dataView], {type: "image/png"});
      var DOMURL = self.URL || self.webkitURL || self;
      var newurl = DOMURL.createObjectURL(blob);

      var img = '<img src="'+newurl+'">'; 
      d3.select("#img").html(img);
    }


    svg.append("image")
        .attr("xlink:href","paint.svg")
        .attr("x", 10)
        .attr("y", 450)
        .attr("width", 30)
        .on("click", function() {

          colorMode = !colorMode;
          if (colorMode) {
            d3.select(this).attr("xlink:href","paint2.svg");
            node.on("click", function(d, i) {
              var c = prompt("Color Hex Code:", "#");
              nodes[i].color = c;

              for (var k in nodes_copy) {
                if (nodes_copy[k].x == nodes[i].x &&
                    nodes_copy[k].y == nodes[i].y) {
                  nodes_copy[k].color = c;
                  break;
                }
              }

              nodes_copy[i].color = c;
              d3.select(this).style("fill", c);
            });
            link.on("click", function(d, i) {
              var c = prompt("Color Hex Code:", "#");
              links[i].color = c;
              d3.select(this).style("stroke", c);
            });
          }
          else {
            d3.select(this).attr("xlink:href","paint.svg");
            node.on("click", function() {});
            link.on("click", function() {});
          }
        });

    svg.append("image")
        .attr("xlink:href","upload.svg")
        .attr("x", 10)
        .attr("y", 500)
        .attr("width", 30)
        .on("click", function() {
            var $inp = $('<input style="display: none" type="file">');
            $("body").append($inp);
            $inp.trigger("click");
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
        {"labelType": "small", "color": "red", "rectText": "", "x": 10, "y": 10},
        {"labelType": "large", "color": "red", "rectText": "", "x": 10, "y": 100}],
      "links": []};

    jsonData["nodes"].push.apply(jsonData["nodes"], initialNodeJSON["nodes"])

    var invisible_node = 0;
    var invisible_node_ind, source_node, noclick;

    // json objects
    var nodes = jsonData["nodes"],
        nodes_copy = nodes.slice(),
        links = jsonData["links"];

    // var node = svg.selectAll(".node");
    var link = svg.selectAll(".link");
    var node = svg.selectAll(".node");
    var labels;

    // drag function for panel nodes
    function nodeDrag(d, i) {
      console.log();
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


      link.each(function(l, li) {
        if (l.source == i) {
          d3.select(this).attr("x1", xGrid).attr("y1", yGrid);
        } else if (l.target == i) {
          d3.select(this).attr("x2", xGrid).attr("y2", yGrid);
        }
      });
    }

    function createNewPanelNode(d, i) {
      if (d.x == 10) {
        console.log("alert");

        var replace_x = 10;
        var replace_y;
        if (d.labelType == "small") {
            replace_y = 10;
        }
        else {
            replace_y = 100;
        }

        nodes.push({"labelType": d.labelType, "color": "red", "rectText": "", "x": replace_x, "y": replace_y});
        nodes_copy.push({"labelType": d.labelType, "color": "red", "rectText": "", "x": replace_x, "y": replace_y});
        refresh();
      }
      else {
        console.log(4444);
      }
    }

    function deleteNode(d, i) {

      if (!invisible_node) {
        vertical.style("stroke", "white");
        horizontal.style("stroke", "white");
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
       .style("stroke-width", 3)
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
       .style("stroke", function(d) {
        return d.color;
       })
       .style("stroke-width", 3)

      node = node.data(nodes);

      // add the nodes
      node.enter().append("rect")
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
            return d.color;
          }
        })
        .call(panelDrag)
        .on("dblclick", doubleClick)

      node.exit().remove();


      vertical.style("stroke", "white");
      horizontal.style("stroke", "white");
    }

    refresh()
     
    // action to take on mouse click
    function doubleClick(d, i) {

      console.log(d);

      var x_val = d.x;
      var y_val = d.y;

      invisible_node_ind = nodes.push({"labelType": "invisible", "color": "red", "rectText": "", x: x_val, y: y_val}) - 1;
      nodes_copy.push({"labelType": "invisible", "color": "red", "rectText": "", x: x_val, y: y_val});
      invisible_link_ind = links.push({"source": i, "target": invisible_node_ind, "color": "black"}) - 1;
      refreshLinks();

      refresh();

      invisible_node = node[0][invisible_node_ind];
      source_node = d;
      source_node_ind = i;
      invisible_link = link[0][invisible_link_ind];

      vertical.style("stroke", "gray");
      horizontal.style("stroke", "gray");

      d3.select(invisible_node).on("click", invisible_click);
    }

    function mousemove() {

      if (invisible_node) {
        var coords = d3.mouse(d3.select('body').node());

        var x_val = coords[0];
        var y_val = coords[1];
        var xGrid, yGrid;

        try {
          var x_source = source_node.x.baseVal.value;
          var y_source = source_node.y.baseVal.value;
        }
        catch(err) {
          var x_source = source_node.x;
          var y_source = source_node.y;
        }


        d3.select(invisible_node)
        .attr("y", function(d, i) {

            if (Math.abs(x_val - x_source) < 10) {

              var modX = x_source % resolution
              if (modX >= 3) {
                xGrid = x_source + (resolution - modX)
              }
              else {
                xGrid = x_source - modX
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

              var modX = coords[0] % resolution
              if (modX >= 3) {
                xGrid = coords[0] + (resolution - modX)
              }
              else {
                xGrid = coords[0] - modX
              }
              
              var modY = y_source % resolution
              if (modY >= 3) {
                yGrid = y_source + (resolution - modY)
              }
              else {
                yGrid = y_source - modY
              }

              d3.select(invisible_node).attr("x", xGrid);
              console.log(y_source);
              return yGrid;
            }
        })

        d3.select(invisible_link)
        .attr("x1", x_source)
        .attr("y1", y_source)
        .attr("x2", invisible_node.x.baseVal.value)
        .attr("y2", invisible_node.y.baseVal.value)
        .style("fill", "none")
        .style("stroke", "black");
      }
    }

    function invisible_click(d, i) {
      console.log(deleteMode);
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

              d3.select(invisible_link).remove();
              links.push({"source": parseInt(ind), "target": source_node_ind, "color": "black"})
              refreshLinks()

              done = true;
              vertical.style("stroke", "white");
              horizontal.style("stroke", "white");
              break;
            }
          }

          if (!done) {
            doubleClick(nodes[invisible_node_ind], invisible_node_ind);
          }

      }
    };

  });
}