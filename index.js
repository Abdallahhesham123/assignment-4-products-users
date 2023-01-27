const express = require("express");
// get the client
const mysql = require("mysql2");
// express app
const app = express();

const PORT = 8000;

/*
CREATE TABLE users (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(30) NOT NULL
email VARCHAR(50)  UNIQUE,
password VARCHAR(30) NOT NULL,
reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE products
(
id int UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL ,
name VARCHAR(50) ,
title VARCHAR(50),
price DECIMAL(10,2) NOT NULL ,
user_id int UNSIGNED  NOT NULL,
constraint u_p foreign key (user_id) references users (id)
);
*/

// create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  database: "abdallah",
  user: "root",
  password: "",
});

// middleware
app.use(express.json());
//////////////////users
//get all users
app.get("/api/", (req, res) => {
  const query = `SELECT * FROM USERS`;
  // with placeholder
  connection.execute(query, (err, result, fields) => {
    if (err) {
      return res.status(400).json({ message: "QueryError", err });
    }
    return res.status(200).json({ message: "Done", result });
  });
});
//add users
app.post("/api/user", (req, res) => {
  const { name, email, password, age } = req.body;

  const query = `INSERT INTO USERS(name, email,password ,age) VALUES('${name}','${email}','${password}',${age})`;
  // with placeholder
  connection.execute(query, (err, result, fields) => {
    if (err) {
      if (err.errno == 1062) {
        return res.status(400).json({ message: "Email Already Exist" });
      }
      return res.status(400).json({ message: "QueryError", err });
    }
    return res
      .status(200)
      .json({ message: "this user added successfully", result });
  });
});
//update users
app.patch("/api/user/:id", (req, res) => {
  const { name, email, age, password } = req.body;

  const { id } = req.params;

  const query = `UPDATE USERS SET name = '${name}',
   email = '${email}' ,age= ${age},password= '${password}' WHERE  id = ${id};`;
  // with placeholder
  connection.execute(query, (err, result, fields) => {
    if (err) {
            if (err.errno == 1062) {
        return res.status(400).json({ message: "Email Already Exist" });
      }
      return res.status(400).json({ message: "QueryError", err });
    }
    return result.affectedRows > 0
      ? res
          .status(200)
          .json({ message: "this user update successfully", result })
      : res.status(400).json({ message: "InValidId", result });
  });
});
//delete user
app.delete("/api/user", (req, res) => {
  const { id } = req.query;

  const query = `DELETE FROM users WHERE  id = ${id};`;
  // with placeholder
  connection.execute(query, (err, result, fields) => {
    if (err) {
      return res.status(400).json({ message: "QueryError", err });
    }
    return result.affectedRows > 0
      ? res
          .status(200)
          .json({ message: "this user is deleted Successfully", result })
      : res.status(400).json({ message: "InValidId", result });
  });
});
//search user with start with a and age less than 30 years
app.get("/api/search", (req, res) => {
  const { age } = req.query;
  const query = ` select * from users where name like "a%" and age <= ${age}`;
  // with placeholder
  connection.execute(query, (err, result, fields) => {
    if (err) {
      return res.status(400).json({ message: "QueryError", err });
    }
    return res
      .status(200)
      .json({ message: "This Users Started with a", result });
  });
});
// getalluserwithproduct
app.get("/api/getalluserwithproduct", (req, res) => {
  const query = `SELECT users.name , email FROM products LEFT OUTER JOIN users ON products.user_id = users.id`;
  // with placeholder
  connection.execute(query, (err, result, fields) => {
    if (err) {
      return res.status(400).json({ message: "QueryError", err });
    }
    return res
      .status(200)
      .json({ message: "This Users Have Aproducts", result });
  });
});
//search for users by list of ids
app.get("/api/getalluserwithlistids", (req, res) => {
  const query = `SELECT * FROM users WHERE id IN (SELECT id FROM users) ORDER BY id DESC`;
  // with placeholder
  connection.execute(query, (err, result, fields) => {
    if (err) {
      return res.status(400).json({ message: "QueryError", err });
    }
    return res
      .status(200)
      .json({ message: "This Users Ordered By Field", result });
  });
});
/////////////////////////////////////products
//add products
app.post("/api/product", (req, res) => {
  const { user_id } = req.query;
  const { name, description, price } = req.body;

  const query = `INSERT INTO products(name, description,price ,user_id) VALUES('${name}','${description}','${price}',${user_id})`;
  // with placeholder
  connection.execute(query, (err, result, fields) => {
    if (err) {
      return res.status(400).json({ message: "QueryError", err });
    }
    return res
      .status(200)
      .json({ message: "this product added successfully", result });
  });
});

//delete product
app.delete("/api/product/:user_id", (req, res) => {
  const { user_id } = req.params;
  const { product_Id } = req.query;

  const query = `DELETE FROM products WHERE  user_id = ${user_id} and id= ${product_Id}`;
  // with placeholder
  connection.execute(query, (err, result, fields) => {
    if (err) {
      return res.status(400).json({ message: "QueryError", err });
    }
    return result.affectedRows > 0
      ? res.status(200).json({
          message: `this product with id = ${product_Id}is deleted Successfully from user ${user_id} `,
          result,
        })
      : res.status(400).json({
          message: "InValid user you can delete only your own products",
          result,
        });
  });
});
//updateproduct

app.put("/api/product/:userId/:product_Id", (req, res) => {
  const { name, description, price } = req.body;

  const { userId, product_Id } = req.params;

  const query = `UPDATE products SET name = '${name}',
                description = '${description}' ,price= ${price} WHERE  user_id = ${userId} and  id=${product_Id}`;
  // with placeholder
  connection.execute(query, (err, result, fields) => {
    if (err) {
      return res.status(400).json({ message: "QueryError", err });
    }
    return result.affectedRows > 0
      ? res.status(200).json({
          message: `this product with id = ${product_Id} with user_id = ${userId} update successfully`,
          result,
        })
      : res.status(400).json({
          message: "InValidUser, you can only update your product only",
          result,
        });
  });
});

//get all products
app.get("/api/product", (req, res) => {
  const query = `SELECT * FROM products`;
  // with placeholder
  connection.execute(query, (err, result, fields) => {
    if (err) {
      return res.status(400).json({ message: "QueryError", err });
    }
    return res
      .status(200)
      .json({ message: "This is all products", result });
  });
});

app.get("/api/product/search", (req, res) => {

    const {price} = req.query;

    const query = ` select * from products WHERE price > ${price}`;
    // with placeholder
    connection.execute(query, (err, result, fields) => {
      if (err) {
        return res.status(400).json({ message: "QueryError", err });
      }
      return res
        .status(200)
        .json({ message: `This product-price greater than ${price}`, result });
    });
  });



app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
