CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  senha_hash VARCHAR(200) NOT NULL,
  gestor TINYINT NOT NULL DEFAULT 0,
  ativo TINYINT NOT NULL DEFAULT 1,
  gestor_unico TINYINT GENERATED ALWAYS AS (IF(gestor=1,1,NULL)) STORED UNIQUE,
  CHECK (gestor IN (0,1)),
  CHECK (ativo IN (0,1))
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS guiches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero SMALLINT UNSIGNED NOT NULL UNIQUE,
  ativo TINYINT NOT NULL DEFAULT 1,
  CHECK (numero BETWEEN 1 AND 999)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS controle_fila (
  id TINYINT PRIMARY KEY
) ENGINE=InnoDB;
INSERT IGNORE INTO controle_fila (id) VALUES (1);
CREATE TABLE IF NOT EXISTS alternancia (
  data_operacao DATE PRIMARY KEY,
  ultimo_tipo ENUM('SP','SE','SG') NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS sequencias (
  data_operacao DATE NOT NULL,
  tipo ENUM('SP','SE','SG') NOT NULL,
  valor SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (data_operacao,tipo),
  CHECK (valor <= 999)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS senhas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero CHAR(12) NOT NULL UNIQUE,
  data_operacao DATE NOT NULL,
  tipo ENUM('SP','SE','SG') NOT NULL,
  sequencia SMALLINT UNSIGNED NOT NULL,
  estado ENUM('EMITIDA','AGUARDANDO','CHAMADA','CHAMADA_NOVAMENTE','EM_ATENDIMENTO','ATENDIDA','NAO_COMPARECEU','DESCARTADA') NOT NULL,
  atendente_id INT UNSIGNED NULL,
  guiche_id INT UNSIGNED NULL,
  emitida_em DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
  primeira_chamada_em DATETIME(3) NULL,
  segunda_chamada_em DATETIME(3) NULL,
  inicio_em DATETIME(3) NULL,
  fim_em DATETIME(3) NULL,
  UNIQUE KEY numero_diario (data_operacao,tipo,sequencia),
  KEY fila (data_operacao,tipo,estado,sequencia),
  KEY atendente_ativo (atendente_id,estado),
  KEY guiche_ativo (guiche_id,estado),
  FOREIGN KEY (atendente_id) REFERENCES usuarios(id),
  FOREIGN KEY (guiche_id) REFERENCES guiches(id),
  CHECK (sequencia BETWEEN 1 AND 999)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS eventos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  senha_id INT UNSIGNED NOT NULL,
  estado ENUM('EMITIDA','AGUARDANDO','CHAMADA','CHAMADA_NOVAMENTE','EM_ATENDIMENTO','ATENDIDA','NAO_COMPARECEU','DESCARTADA') NOT NULL,
  usuario_id INT UNSIGNED NULL,
  ocorrido_em DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
  KEY historico (senha_id,id),
  FOREIGN KEY (senha_id) REFERENCES senhas(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS sessoes (
  token_hash CHAR(64) PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  expira_em DATETIME(3) NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  KEY validade (expira_em)
) ENGINE=InnoDB;
