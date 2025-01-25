const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));


const recordsFilePath = path.join(__dirname, "data", "records.json");


app.post("/api/records", (req, res) => {
     const record = req.body;


    fs.access(recordsFilePath, fs.constants.F_OK, (err) => {
          if (err) {
            fs.mkdir(path.dirname(recordsFilePath), { recursive: true }, (err) => {
                if (err) {
                    console.error("Error creating directory:", err);
                    return res.status(500).json({ error: "Gabim gjatë ruajtjes së të dhënave." });
                }
                fs.writeFile(recordsFilePath, "[]", (err) => {
                     if (err) {
                         console.error("Error creating file:", err);
                       return res.status(500).json({ error: "Gabim gjatë ruajtjes së të dhënave." });
                  }
                      fs.readFile(recordsFilePath, "utf8", (err, data) => {
                          if (err) {
                              console.error("Error reading file:", err);
                              return res.status(500).json({ error: "Gabim gjatë ruajtjes së të dhënave." });
                            }
                            const records = JSON.parse(data);
                            records.push(record);


                            fs.writeFile(recordsFilePath, JSON.stringify(records, null, 2), (err) => {
                                if (err) {
                                    console.error("Error writing to file:", err);
                                  return res.status(500).json({ error: "Gabim gjatë ruajtjes së të dhënave." });
                                  }
                                res.status(201).json({ message: "Të dhënat u ruajtën me sukses!" });
                                });
                        });
                    });
                });
        } else {
               fs.readFile(recordsFilePath, "utf8", (err, data) => {
                        if (err) {
                                  console.error("Error reading file:", err);
                                   return res.status(500).json({ error: "Gabim gjatë ruajtjes së të dhënave." });
                                 }
                         const records = JSON.parse(data);
                          records.push(record);


                        fs.writeFile(recordsFilePath, JSON.stringify(records, null, 2), (err) => {
                            if (err) {
                                console.error("Error writing to file:", err);
                                  return res.status(500).json({ error: "Gabim gjatë ruajtjes së të dhënave." });
                             }
                             res.status(201).json({ message: "Të dhënat u ruajtën me sukses!" });
                             });
                     });
        }
    });
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});