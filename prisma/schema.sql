
create table Pessoa(
id integer not null auto_increment primary key,
nome varchar(200) not null,
email varchar(200) not null,
telefone varchar(15) not null,
idade varchar(3) not null,
senha varchar(16) default "",
categoria varchar(20) default "individual"
);

create table Evento(
id integer not null auto_increment primary key,
nome varchar(200) not null,
data_evento date not null,
qtd_lugares integer not null,
status varchar(2) default "D" /*D: DISPONIVEL F: Finalizado*/
);

create table Lugar(
id integer not null auto_increment primary key,
posicao varchar(10) not null,
nome_reservado varchar(200) default null,
id_pessoa integer default null,
id_evento integer not null,
status char default 'D', /*D - Disponível R - Reservado*/
data_reserva datetime default null,
foreign key (id_pessoa) references Pessoa(id),
foreign key (id_evento) references Evento(id)
);

CREATE UNIQUE INDEX `idx_pessoa_telefone`  ON `db_meulugaribcl`.`pessoa` (telefone) COMMENT '' ALGORITHM DEFAULT LOCK DEFAULT;