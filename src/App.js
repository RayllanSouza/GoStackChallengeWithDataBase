const { json } = require('express');
const express = require('express');
const { v4: uuid, validate: isUuid } = require('uuid');
const { query } = require('./dataBase');
const connection = require('./dataBase');
const app = express();

connection.connect();

app.use(json());

app.get("/users", function(req, res){
    connection.query('SELECT * FROM usuarios', function(error, results, fields){
        if(error) throw error;
        return res.status(200).json(results);
    })
})

app.post("/users", function(req, res){
    const {nome, likes, foto} = req.body;
    var post = {
        id: uuid(),
        nome: nome,
        likes: likes,
        foto: foto
    }
    var query = connection.query('INSERT INTO usuarios SET ?', post, function (error, results, fields){
        if(error) throw error;
    })
    return res.status(201).json(post);
})

app.post("/users/:id/like", function(req, res){
    const {id} = req.params;  
    var controle = connection.query("SELECT * from usuarios WHERE id = ?", id , function(error, results, fields){
        if(error) throw error;
        if(results.length <= 0){
            return res.status(404).json({
                Error: "User not found"
            })
        }
        var likes = results[0].likes + 1;
        setUsersLike(id, likes);
    });
    function setUsersLike(id, likes){
        connection.query("UPDATE usuarios SET likes = ? WHERE id = ?", [likes, id], function(error, results, fields){
           if(error) throw error;
        });
        return res.status(201).json({
            Sucesso:"Ocorreu tudo como o esperado!"
        })
        
    }
})

app.put("/users/:id", function(req, res){
    const {id} = req.params;
    const userInput = req.body;
    connection.query("SELECT * FROM usuarios where id = ?", id, function(error, results, fields){
        if(error) throw error;
        if(results.length <=0){
            return res.status(404).json({
                Error: "User not found"
            })
        }        
        editProfile(userInput, results);
    })
    function editProfile(userInput, results){
        const {name, newPic} = userInput;
        connection.query("UPDATE usuarios SET nome = ?, foto = ? WHERE id = ?", [name, newPic, results[0].id], function(error, results, fields){
            if(error) throw error;
         });
         return res.status(200).json({
             Sucess: "Ocorreu tudo como o esperado!"
         })
    }
})

app.delete("/users/:id", function(req, res){
    const {id} = req.params;
    connection.query("DELETE FROM usuarios WHERE id = ?", [id], function(error, results, fields){
        if(results.affectedRows < 1){
            return res.status(404).json({
                Error: "User Not Found"
            })
        }   
        if(error) throw error;
        return res.status(200).json({
            Sucess: "Ocorreu tudo como o esperado"
        })
    });

})


module.exports = app;