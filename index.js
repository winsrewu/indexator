import { readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";

function generateFileIndex(basePath) {
    const index = [];

    function walk(dir, currentIndex) {
        const files = readdirSync(dir);
        files.forEach((file) => {
            const fullPath = join(dir, file);
            if (fullPath.startsWith(".git")) return; // Ignore .git directory
            if (statSync(fullPath).isDirectory()) {
                const subDir = { dir: file, files: [] };
                currentIndex.push(subDir)
                walk(fullPath, subDir.files);
            } else {
                currentIndex.push(file)
            }
        });
    }

    walk(basePath, index);
    return index;
}

function generateHtml(index) {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Index</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      ul { list-style-type: none; padding-left: 20px; }
      li { margin: 5px 0; }
      a { text-decoration: none; color: #0366d6; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <h1>Index</h1>
    <div id="file-index"></div>
  
    <script>
      const fileIndex = ${JSON.stringify(index, null, 2)};
  
      function renderIndex(index, container, basePath = "") {
      const ul = document.createElement('ul');

      index.forEach((item) => {
        const li = document.createElement('li');
        if (typeof item === 'string') {
          // File
          const a = document.createElement('a');
          a.textContent = item;
          a.href = basePath + item; // Correctly prepend the basePath for nested files
          li.appendChild(a);
        } else {
          // Directory
          const folderName = document.createTextNode(item.dir + '/');
          li.appendChild(folderName);

          const subContainer = document.createElement('div');
          li.appendChild(subContainer);
          renderIndex(item.files, subContainer, basePath + item.dir + "/");
        }
        ul.appendChild(li);
      });

      container.appendChild(ul);
    }
  
      const container = document.getElementById('file-index');
      renderIndex(fileIndex, container);
    </script>
  </body>
  </html>`;
}

function main() {
    const basePath = process.env.INPUT_PATH || ".";
    const outputPath = process.env.OUTPUT_INDEX_PATH || "index.html";
    const index = generateFileIndex(basePath);
    // console.log(JSON.stringify(index, null, 2));

    // Generate HTML file
    const html = generateHtml(index);
    writeFileSync(outputPath, html);
    // console.log("Generated index.html");
}

main();
