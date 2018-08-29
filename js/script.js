var canvas = document.getElementById("newCanvas");
var ctx = canvas.getContext("2d");

var tempX, tempY;
var insidePadX = 200, insidePadY = 100;
var radius = 13, borderRadius = 10, nodeCount = document.getElementById("node-count").value, nodeMinCount = 3, nodeMaxCount = 15;
var nodeMinDist = 150;
var nodeColor = "#247BA0", lineColor = "#247BA0", backgroundColor = "#B2DBBF";
var memo, parent, def, INF = 2e9, nodeList;

window.addEventListener("resize", resize, false);
resize();

function euclideanDist(a, b){
    return Math.floor(Math.sqrt(((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y))));
}

function generateAllNode(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for(var i=0;i<nodeCount;i++){
        var isT, currNode;

        do{
            isT = false;
            tempX = Math.floor(Math.random() * (canvas.width - insidePadX)) + (insidePadX / 2);
            tempY = Math.floor(Math.random() * (canvas.height - insidePadY)) + (insidePadY / 2);
            currNode = {"x": tempX, "y":tempY};
            for(var j=0;j<nodeList.length;j++){
                var node = nodeList[j];
                if(euclideanDist(node, currNode) < nodeMinDist){
                    isT = true;
                    break;
                }
            }
        }while(isT);
        
        nodeList.push({"x":tempX, "y":tempY});
    }
}

function tsp(idx, mask){
    if(memo[idx][mask] != -1)
        return memo[idx][mask];
    if(mask == def && idx != 0)
        return INF;

    var m = 1;
    var mn = INF, tmp, t = -1;
    for(var i=0;i<nodeCount;i++){
        if((mask & m) == 0){
            tmp = tsp(i, (mask|m)) + euclideanDist(nodeList[idx], nodeList[i]);
            
            if(tmp < mn){
                mn = tmp;
                t = i;
            }
        }
        m = m<<1;
    }

    parent[idx][mask] = t;
    return memo[idx][mask] = mn;
}

function generateTsp(){
    var currArr = [], tempArr = [];
    def = 1<<nodeCount;
    for(var i=0;i<def;i++){
        currArr.push(-1);
        tempArr.push(-1);
    }

    for(var i=0;i<nodeCount;i++){
        memo.push(currArr.slice());
        parent.push(tempArr.slice());
    }
    
    def--;
    memo[0][def] = 0;
    var res = tsp(0, 0);
    document.getElementById("result").innerHTML = "Total Distance: " + Math.floor(res);
}

function drawRes(){
    var idx = 0, mask = 0;
    var content = "1";
    
    while(!(idx == 0 && mask == def)){
        var m = 1;
        var res = parent[idx][mask];
        content += "-" + (res+1);

        ctx.moveTo(nodeList[idx].x, nodeList[idx].y);
        ctx.lineTo(nodeList[res].x, nodeList[res].y);
        ctx.strokeStyle = lineColor;
        ctx.stroke();

        ctx.font = "600 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#000";
        ctx.fillText(euclideanDist(nodeList[idx], nodeList[res]), (nodeList[idx].x + nodeList[res].x) / 2, (nodeList[idx].y + nodeList[res].y) / 2);

        m = m << res;
        idx = res;
        mask = (mask | m);
    }
    document.getElementById("result").innerHTML += "<br>Path: " + content;
}

function generateNode(tempX, tempY, idx){
    ctx.beginPath();
    ctx.arc(tempX, tempY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = nodeColor;
    ctx.fill();

    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFF";
    ctx.fillText(idx, tempX, tempY + radius/2);
}

function redraw(){
    document.getElementById("detail").innerHTML = "";
    var content = "";
    for(var i=0;i<nodeCount;i++){
        generateNode(nodeList[i].x, nodeList[i].y, (i+1));
        content += "<tr><td>" + (i+1) + "</td><td>" + nodeList[i].x + "</td><td>" + nodeList[i].y + "</td></tr>";
    }
    document.getElementById("detail").innerHTML += "<table><tr><th>Node</th><th>X</th><th>Y</th>" + content + "</table>";
}

function resize(){
    canvas.width = document.getElementById("canvas-parent").offsetWidth;
    canvas.height = document.getElementById("canvas-parent").offsetHeight;
    nodeList = [];
    memo = [];
    parent = [];
    def = 0;
    generateAllNode();
    generateTsp();
    drawRes();
    redraw();
}

function setCount(){
    event.preventDefault();
    var count = document.getElementById("node-count").value;
    if(count <= nodeMaxCount && count >= nodeMinCount){
        nodeCount = count;
        resize();
    }
}