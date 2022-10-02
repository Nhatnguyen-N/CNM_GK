const express = require("express");
const AWS = require("aws-sdk");
const multer = require("multer");

const app = express();
const upload = multer();

AWS.config = new AWS.Config({
  accessKeyId: "AKIA2JFM2BWEZR6EQIEM",
  secretAccessKey: "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",
  region: "ap-northeast-1",
});

app.use(express.static("./templates"));
app.set("view engine", "ejs");
app.set("views", "./templates");

const tableName = "Paper";
const docClient = new AWS.DynamoDB.DocumentClient();

let numbaibao = 0;

app.get("/", (req, res) => {
  res.render("index_input");
});
app.get("/list", (req, res) => {
  const param = {
    TableName: tableName,
  };
  docClient.scan(param, (err, data) => {
    if (err) {
      res.send("LOI");
      return;
    }
    if (data) {
      numbaibao = data.Count;
      return res.render("index", { data: data.Items });
    }
  });
});

app.post("/", upload.fields([]), (req, res) => {
  const { tenbaibao, tentacgia, sotrang, namxb } = req.body;
  numbaibao++;
  const param = {
    TableName: tableName,
    Item: {
      id: numbaibao + "",
      tenbaibao: tenbaibao,
      tentacgia: tentacgia,
      sotrang: sotrang,
      namxb: namxb,
    },
  };
  docClient.put(param, (err, data) => {
    if (err) {
      res.send("LOI " + err);
      return;
    } else {
      console.log(numbaibao);
      return res.redirect("/list");
    }
  });
});
app.post("/delete", upload.fields([]), (req, res) => {
  const listItem = Object.keys(req.body);

  if (listItem.length === 0) {
    return res.redirect("/list");
  }
  function onDelete(index) {
    const param = {
      TableName: tableName,
      Key: {
        id: listItem[index],
      },
    };
    docClient.delete(param, (err, data) => {
      if (err) return res.send("LOI:" + err);
      else {
        if (index > 0) onDelete(index - 1);
        else return res.redirect("/list");
      }
    });
  }
  onDelete(listItem.length - 1);
});

app.listen(5001, () => {
  console.log("Server on port 5001 ");
});
