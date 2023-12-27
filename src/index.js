const fs = require("fs");
const PATH = require("path");
const sharp = require("sharp");
const { promisify } = require("util");
const http = require("http");
var ProgressBar = require("progress");

// 使用promisify将fs的readdir和stat方法转化为promise方法
const readdirAsync = promisify(fs.readdir);

async function readFileList(path, filesList) {
  try {
    const files = await readdirAsync(path);

    // 初始化进度条
    let bar = new ProgressBar(
      "[:bar] percent eta: :eta formatting :current/:total :file",
      {
        complete: "=",
        total: files.length,
        width: 50,
      }
    );
    let id = setInterval(function () {
      // bar.tick({
      //   'file': files[bar.curr]
      // })
      if (bar.complete) {
        clearInterval(id);
        console.log("\n转换成功！！！\n");
      }
    }, 100);

    files.forEach((itm) => {
      const filePath = path + itm;
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        // 递归读取子目录
        readFileList(filePath, filesList);
      } else {
        let obj = {};
        obj.path = filePath;
        obj.filename = itm;
        filesList.push(obj);

        let extensionIndex = itm.lastIndexOf(".");
        let filename =
          extensionIndex !== -1 ? itm.slice(0, extensionIndex) : itm;
        let newFilePath = `${path.slice(0, -1)}_new/${filename}.webp`;

        if (!fs.existsSync(PATH.parse(newFilePath).dir)) {
          fs.mkdirSync(PATH.parse(newFilePath).dir);
        }

        try {
          sharp(filePath)
            .toFile(newFilePath)
            .then((info) => {
              // console.log("🚀 ~ file: index.js:56 ~ .then ~ info:", info)
              bar.tick({ file: files[bar.curr] });
            })
            .catch((err) => {
              console.error("🚀 ~ file: index.js:40 ~ error:", err);
            });
        } catch (error) {
          console.error("🚀 ~ file: index.js:43 ~ error:", error);
        }
      }
    });
  } catch (error) {
    console.error("🚀 ~ file: index.js:48 ~ error:", error);
  }
}

// 调用函数示例
let fileList = [];
readFileList("./images/", fileList);

http
  .createServer((req, res) => {
    console.log("🚀 ~ file: index.js:12 ~ req.url:", req.url);
    if (req.url === "/favicon.ico") {
      res.writeHead(200, { "Content-Type": "image/x-icon" });
      res.end();
    } else {
    }
  })
  .listen(3000, (e) => {
    console.log("格式化启动");
  });
