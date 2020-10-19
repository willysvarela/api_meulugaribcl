

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Copiando estrutura para tabela heroku_1d143770896e70c.evento
CREATE TABLE IF NOT EXISTS `evento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(200) NOT NULL,
  `data_evento` datetime NOT NULL,
  `qtd_lugares` int(11) NOT NULL,
  `status` varchar(2) DEFAULT 'D',
  `tipoLayout` varchar(20) DEFAULT 'familia', /*define o layout do culto*/
  `tipoEvento` varchar(20) DEFAULT 'familiar', /*define o periodo de reserva*/
  `tipoReserva` VARCHAR(20) DEFAULT 'cadeiras';
  
  /*
  tipoReserva:
  - cadeiras: Reserva por seleção de cadeiras
  - nomes: Reserva por nome do individuo, sem cadeiras
  */
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=461 DEFAULT CHARSET=utf8;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela heroku_1d143770896e70c.lugar
CREATE TABLE IF NOT EXISTS `lugar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `posicao` varchar(10) NOT NULL,
  `nome_reservado` varchar(200) DEFAULT NULL,
  `id_pessoa` int(11) DEFAULT NULL,
  `id_evento` int(11) NOT NULL,
  `status` char(1) DEFAULT 'D',
  `data_reserva` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_pessoa` (`id_pessoa`),
  KEY `id_evento` (`id_evento`),
  CONSTRAINT `lugar_ibfk_1` FOREIGN KEY (`id_pessoa`) REFERENCES `pessoa` (`id`),
  CONSTRAINT `lugar_ibfk_2` FOREIGN KEY (`id_evento`) REFERENCES `evento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41711 DEFAULT CHARSET=utf8;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela heroku_1d143770896e70c.pessoa
CREATE TABLE IF NOT EXISTS `pessoa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `telefone` varchar(15) NOT NULL,
  `idade` varchar(3) NOT NULL,
  `senha` varchar(16) DEFAULT '',
  `categoria` varchar(20) DEFAULT 'individual',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_pessoa_telefone` (`telefone`)
) ENGINE=InnoDB AUTO_INCREMENT=5401 DEFAULT CHARSET=utf8;

-- Exportação de dados foi desmarcado.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

