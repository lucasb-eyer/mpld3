var vows = require("vows"),
    load = require("../load"),
    assert = require("assert");

var suite = vows.describe("mpld3.Text");

suite.addBatch({
    "Text": {
        topic: load("elements/path").document(),
        "A simple Text object": {
            topic: function(mpld3) {
                var fig_props = {
                    width: 400,
                    height: 300
                };
                var ax_props = {
                    xlim: [0, 4],
                    ylim: [0, 4],
                    axes: []
                };
                var text_props = {
                    text: "hello world",
                    position: [1, 3]
                };
                var fig = new mpld3.Figure("chart", fig_props);
                var ax = new mpld3.Axes(fig, ax_props);
                var text = new mpld3.Text(ax, text_props);
                ax.elements.push(text);
                fig.axes.push(ax);
                fig.draw();
                return text;
            },
            "contains the expected text": function(text) {
                assert.equal(text.text, "hello world");
            },
            "has the expected coordinate transform": function(text) {
                assert.equal(text.props.coordinates, "data");
            },
            "has the expected position": function(text) {
                assert.equal(text.position[0], 1);
                assert.equal(text.position[1], 3);
            }
        },
        "A clipped display-coordinate Text object": {
            topic: function(mpld3) {
                var fig_props = {
                    width: 400,
                    height: 300
                };
                var ax_props = {
                    xlim: [0, 4],
                    ylim: [0, 4],
                    axes: []
                };
                var text_props = {
                    text: "hello world",
                    position: [100, 100],
                    coordinates: "display",
                    clip_on: true
                };
                var root = document.createElement("div");
                root.setAttribute("id", "chart_clip");
                document.body.appendChild(root);
                var fig = new mpld3.Figure("chart_clip", fig_props);
                var ax = new mpld3.Axes(fig, ax_props);
                var text = new mpld3.Text(ax, text_props);
                ax.elements.push(text);
                fig.axes.push(ax);
                fig.draw();
                return text;
            },
            "uses the axes clip path": function(text) {
                assert.equal(text.obj.attr("clip-path"), null);
                assert.equal(text.obj.node().parentNode.getAttribute("clip-path"),
                             "url(#chart_clip_ax1_clip)");
            }
        },
        "A clipped data-coordinate Text object": {
            topic: function(mpld3) {
                var fig_props = {
                    width: 400,
                    height: 300
                };
                var ax_props = {
                    xlim: [0, 4],
                    ylim: [0, 4],
                    axes: []
                };
                var text_props = {
                    text: "hello world",
                    position: [1, 5],
                    coordinates: "data",
                    clip_on: true
                };
                var root = document.createElement("div");
                root.setAttribute("id", "chart_data_clip");
                document.body.appendChild(root);
                var fig = new mpld3.Figure("chart_data_clip", fig_props);
                var ax = new mpld3.Axes(fig, ax_props);
                var text = new mpld3.Text(ax, text_props);
                ax.elements.push(text);
                fig.axes.push(ax);
                fig.draw();
                return text;
            },
            "uses the clipped data layer": function(text) {
                var textParent = text.obj.node().parentNode;
                assert.equal(text.obj.attr("clip-path"), null);
                assert.equal(textParent.getAttribute("class"), "mpld3-zoomable");
                assert.equal(textParent.parentNode.getAttribute("clip-path"),
                             "url(#chart_data_clip_ax1_clip)");
            }
        },
        "An unclipped data-coordinate Text object": {
            topic: function(mpld3) {
                var fig_props = {
                    width: 400,
                    height: 300
                };
                var ax_props = {
                    xlim: [0, 4],
                    ylim: [0, 4],
                    axes: []
                };
                var text_props = {
                    text: "hello world",
                    position: [1, 5],
                    coordinates: "data"
                };
                var root = document.createElement("div");
                root.setAttribute("id", "chart_unclipped");
                document.body.appendChild(root);
                var fig = new mpld3.Figure("chart_unclipped", fig_props);
                var ax = new mpld3.Axes(fig, ax_props);
                var text = new mpld3.Text(ax, text_props);
                ax.elements.push(text);
                fig.axes.push(ax);
                fig.draw();
                return text;
            },
            "does not inherit the axes clip path": function(text) {
                assert.equal(text.obj.attr("clip-path"), null);
                assert.equal(text.obj.node().parentNode.getAttribute("class"),
                             "mpld3-zoomable");
                assert.equal(text.obj.node().parentNode.parentNode.getAttribute("clip-path"),
                             null);
            }
        },
        "An unclipped data-coordinate Text object with low zorder": {
            topic: function(mpld3) {
                var root = document.createElement("div");
                root.setAttribute("id", "chart_zorder");
                document.body.appendChild(root);
                var fig_props = {
                    width: 400,
                    height: 300,
                    plugins: [],
                    axes: [{
                        xlim: [0, 4],
                        ylim: [0, 4],
                        axes: [],
                        paths: [{
                            data: [[0, 0], [4, 4]],
                            pathcodes: ["M", "L"],
                            coordinates: "data",
                            zorder: 10
                        }],
                        texts: [{
                            text: "under path",
                            position: [1, 3],
                            coordinates: "data",
                            zorder: 1
                        }]
                    }]
                };
                var fig = new mpld3.Figure("chart_zorder", fig_props);
                fig.draw();
                return {
                    textNode: document.querySelector("#chart_zorder text.mpld3-text"),
                    pathNode: document.querySelector("#chart_zorder path.mpld3-path")
                };
            },
            "stays below a higher-zorder data path": function(nodes) {
                var relation = nodes.textNode.compareDocumentPosition(nodes.pathNode);
                assert.ok(relation & document.defaultView.Node.DOCUMENT_POSITION_FOLLOWING);
            }
        },
        "An axes-coordinate Text object with high zorder": {
            topic: function(mpld3) {
                document.defaultView.SVGElement.prototype.getBBox = function() {
                    return {x: 0, y: 0, width: 10, height: 10};
                };
                document.defaultView.SVGElement.prototype.getComputedTextLength = function() {
                    return 10;
                };

                var root = document.createElement("div");
                root.setAttribute("id", "chart_axis_zorder");
                document.body.appendChild(root);
                var fig_props = {
                    width: 400,
                    height: 300,
                    plugins: [],
                    axes: [{
                        xlim: [0, 4],
                        ylim: [0, 4],
                        texts: [{
                            text: "over axis",
                            position: [0, 0],
                            coordinates: "axes",
                            zorder: 100
                        }]
                    }]
                };
                var fig = new mpld3.Figure("chart_axis_zorder", fig_props);
                fig.draw();
                return {
                    textNode: document.querySelector("#chart_axis_zorder text.mpld3-text"),
                    axisNode: document.querySelector("#chart_axis_zorder g.mpld3-xaxis")
                };
            },
            "stays above lower-zorder axis artists": function(nodes) {
                var relation = nodes.axisNode.compareDocumentPosition(nodes.textNode);
                assert.ok(relation & document.defaultView.Node.DOCUMENT_POSITION_FOLLOWING);
            }
        }
    }
});

suite.export(module);
