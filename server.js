const PORT = 3000;
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const router = express.Router();
const filePath = path.join(__dirname, 'students.json');
// create application/json parser
const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

//search student
router.get('/:id', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data)=> {
    if (err) {
        res.send(err);
    }
    let studentDatas = JSON.parse(data);
    res.send(studentDatas.find((element) => {
      return element._id === parseInt(req.params.id, 10);
    }));
  });
});

//create new student without scores
//need to set body to x-www-form-urlencoded in Postman
router.post('/', urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  fs.readFile(filePath, 'utf8', (err, data)=> {
    if (err) {
        res.send(err);
    }
    let studentDatas = JSON.parse(data);

    let newStudent = {};
    for (let prop in req.body) {
      newStudent[prop] = req.body[prop];
    }
    let newId = -1;
    studentDatas.forEach((student)=>{
      if(student._id > newId) newId = student._id;
    });
    newStudent._id = newId + 1;
    newStudent.scores = [];
    studentDatas.push(newStudent);

    fs.writeFile(filePath, JSON.stringify(studentDatas, null, 4), (err) => {
      if (err) {
        res.sendStatus(403); // equivalent to res.status(403).send('Forbidden')
      }
      else {
        res.sendStatus(200);// equivalent to res.status(200).send('OK')
      }
    });

  });
});

//update scores
//need to set body to x-www-form-urlencoded in Postman
router.put('/:id', urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  fs.readFile(filePath, 'utf8', (err, data)=> {
    if (err) {
      res.send(err);
    }
    let studentDatas = JSON.parse(data);
    let targetIndex = studentDatas.findIndex((element) => {
      return element._id === parseInt(req.params.id, 10);
    });
    if(targetIndex === -1) {
      res.sendStatus(400);
    }
    else {
      for (let prop in req.body) {
        studentDatas[targetIndex].scores.push({"type":prop, "score":parseInt(req.body[prop], 10)});
      }

      fs.writeFile(filePath, JSON.stringify(studentDatas, null, 4), (err) => {
        if (err) {
          res.sendStatus(403); // equivalent to res.status(200).send('OK')
        }
        else {
          res.sendStatus(200); // equivalent to res.status(403).send('Forbidden')
        }
      });
    }
  });
});

//delete student
router.delete('/:id', function (req, res) {
  fs.readFile(filePath, 'utf8', (err, data)=> {
    if (err) {
      res.send(err);
    }
    let studentDatas = JSON.parse(data);
    let targetIndex = studentDatas.findIndex((element) => {
      return element._id === parseInt(req.params.id, 10);
    });
    if(targetIndex === -1) {
      res.sendStatus(400);
    }
    else {
      studentDatas.splice(targetIndex, 1);
      fs.writeFile(filePath, JSON.stringify(studentDatas, null, 4), (err) => {
        if (err) {
          res.sendStatus(403);
        }
        else {
          res.sendStatus(200);
        }
      });
    }
  });
});

app.set('port', PORT);
app.use('/student', router);
app.listen(app.get('port'), () => {
    console.log('Server listening on port ' + app.get('port'));
});
