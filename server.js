const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // TODO: Add MySQL password
        password: 'rootroot',
        database: 'employees_db'
    },
    console.log(`Connected to the employees_db database.`)
);

db.connect(function (err) {
    if (err) throw err;
  });

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Prompt
function init() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "choice",
                message: "What would you like to do?",
                choices: [
                    "View all departments",
                    "View all roles",
                    "View all employees",
                    "Add a department",
                    "Add a role",
                    "Add an employee",
                    "Update an employee role",
                    "Exit"
                ]
            }
        ])
        .then((data) => {
            switch (data.choice) {
                case "View all departments":
                    db.query('SELECT * FROM department', function (err, results) {
                        console.log(results);
                    });
                    break;
                case "View all roles":
                    db.query('SELECT * FROM role', function (err, results) {
                        console.log(results);
                    });
                    break;
                case "View all employees":
                    db.query(`SELECT e.id, e.first_name, e.last_name, r.title, d.name, r.salary,
                    m.first_name AS "Manager First Name", m.last_name AS "Manager Last Name"
                    FROM employee e
                    JOIN role r ON e.role_id = r.id
                    JOIN department d ON r.department_id = d.id
                    JOIN employee m ON e.manager_id = m.id;`, function (err, results) {
                        console.log(results);
                    });
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Update an employee role":
                    updateEmployee();
                    break;
                case "Exit":
                    process.exit();
                    break;
            }
        });
}

function addDepartment() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "department",
                message: "Enter the name of your department."
            }
        ])
        .then((data) => {
            db.query(`INSERT INTO department (name) VALUES (?)`, data.department, (err, result) => {
                if (err) {
                    console.log(err);
                }
                console.log(result);
            });
        });
}

function addRole() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "title",
                message: "Enter the name of your role."
            }, {
                type: "input",
                name: "salary",
                message: "Enter the salary of your role."
            }, {
                type: "input",
                name: "department_id",
                message: "Enter the department ID of your role."
            }
        ])
        .then((data) => {
            db.query(`INSERT INTO role (title, salary, department_id)
            VALUES (?, ?, ?)`, [data.title, data.salary, data.department_id], (err, result) => {
                if (err) {
                    console.log(err);
                }
                console.log(result);
            });
        });
}

function addEmployee() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "first_name",
                message: "Enter the employee's first name."
            }, {
                type: "input",
                name: "last_name",
                message: "Enter the employee's last name."
            }, {
                type: "input",
                name: "role_id",
                message: "Enter the employee's role ID."
            }, {
                type: "input",
                name: "manager_id",
                message: "Enter the employee's manager's ID."
            }
        ])
        .then((data) => {
            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES (?, ?, ?, ?)`, [data.first_name, data.last_name, data.role_id, data.manager_id], (err, result) => {
                if (err) {
                    console.log(err);
                }
                console.log(result);
            });
        });
}

function updateEmployee() {
    db.query(`SELECT id, first_name, last_name FROM employee`, (err, employees) => {
        if (err) {
            console.log(err);
        }
        console.log(employees);

        const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id
        }));


        db.query(`SELECT id, title FROM role`, (err2, roles) => {
            if (err2) {
                console.log(err2);
            }
            console.log(roles);

            const roleChoices = roles.map(({ id, title }) => ({
                name: title,
                value: id
            }));


            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employee",
                        message: "Select the employee ID",
                        choices: employeeChoices
                    }, {
                        type: "list",
                        name: "role",
                        message: "Select the role",
                        choices: roleChoices
                    }
                ])
                .then((data) => {
                    console.log(data)
                    db.query(`UPDATE employee SET role_id = ? WHERE id=?`, [data.role, data.employee], (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log(result);
                    })
                })
        });
    });
};

init();