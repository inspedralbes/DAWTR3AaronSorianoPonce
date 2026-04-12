DROP DATABASE IF EXISTS ticketing_db;
CREATE DATABASE ticketing_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ticketing_db;

CREATE TABLE esdeveniments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    data DATETIME NOT NULL,
    descripcio TEXT,
    tag VARCHAR(100) DEFAULT 'General',
    imatge VARCHAR(255),
    aforament INT NOT NULL,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    esdeveniment_id INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    preu DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (esdeveniment_id) REFERENCES esdeveniments(id) ON DELETE CASCADE
);

CREATE TABLE seients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    fila VARCHAR(10) NOT NULL,
    numero INT NOT NULL,
    estat ENUM('Lliure', 'Venut') DEFAULT 'Lliure',
    FOREIGN KEY (categoria_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE usuaris (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contrasenya VARCHAR(255) DEFAULT NULL,
    admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE reserves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuari_id INT NOT NULL,
    seient_id INT NOT NULL,
    data_expiracio DATETIME NOT NULL,
    estat ENUM('Pendent', 'Completada', 'Expirada') DEFAULT 'Pendent',
    FOREIGN KEY (usuari_id) REFERENCES usuaris(id) ON DELETE CASCADE,
    FOREIGN KEY (seient_id) REFERENCES seients(id) ON DELETE CASCADE
);
