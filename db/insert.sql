INSERT INTO department (name)
VALUES
    ("R&D"),
    ("marketing"),
    ("sales");

INSERT INTO role (title, salary, department_id)
VALUES
    ("analyst", 75000, 2),
    ("cashier", 40000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ("Bob", "Loving", 2, 1),
    ("John", "Doo", 1, 1);
