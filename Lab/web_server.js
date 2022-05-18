var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var cors = require('cors');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var urlencodeJsonParser=bodyParser.json({ type: 'application/json' });
var app = express();
let port =6969;
var id =0;
app.use(cors());
var dipendenti=[];
var nomeFile="dipendenti.save";
load();
if(dipendenti.length!=0){//carica l'ultimo id 
    id = parseInt(dipendenti[dipendenti.length-1].id)+1;
}
/*funzioni*/
function dip(id,nome,cognome,sesso,luogoDiNascita,dataDiNascita,codiceFiscale,ruoloAziendale,stipendio,titoloDiStudio){
    this.id= parseInt(id);
    this.nome= nome;
    this.cognome=cognome;
    this.sesso=sesso;
    this.luogoDiNascita=luogoDiNascita;
    this.dataDiNascita=dataDiNascita;
    this.codiceFiscale=codiceFiscale;
    this.ruoloAziendale=ruoloAziendale;
    this.stipendio=parseFloat(stipendio);
    this.titoloDiStudio=titoloDiStudio;
}
function save(){
    let file = fs.openSync(nomeFile,"w");
    fs.writeSync(file,JSON.stringify(dipendenti,null,2));
    fs.closeSync(file);
}
function load(){
    let file;
    if(!fs.existsSync(nomeFile)){
        file=fs.createWriteStream(nomeFile,{encoding:'utf8'});
    }else{
        dipendenti=JSON.parse(fs.readFileSync(nomeFile,{encoding: 'utf8'}));
    }
}
function validazioni(stringa,controllo){
    const paths=[
        /\d+/,//id
        /^[a-z ,.'-]*$/i,//nome
        /^[a-z ,.'-]*$/i,//cognome
        /[a-z]/i,//gender
        /^[a-z ,.'-]*$/i,//luogo di nascita
        /(19|20)\d\d[-/.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])/, //data di nascita
        /[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]/i,//codice fiscale
        /^[a-z ,'-]*$/i,//ruolo aziendale
        /\d+\.\d{2}/, //stipendio
        /^[a-z ,.'-]*$/i //titolo di studio
    ];
    
    let esito = false;
    if(controllo >=0 && controllo<paths.length){
        esito = paths[controllo].test(stringa);
    }
    return esito;
}
/*fine funzioni*/
/*requestst*/
app.get('/:id/get',urlencodedParser,function(req,res){
    let id = req.params.id;
    let dipendente;
    if(validazioni(id,0)){
        for(let i = 0;i<dipendenti.length;i++){
            if(id==dipendenti[i].id){
                dipendente=dipendenti[i];
            }
        }
        if(dipendente!=undefined){
            res.end(JSON.stringify(dipendente,null,2))
        }else{
            res.end(JSON.stringify("Dipendente non trovato",null,2));
        }
    }else{
        res.end(JSON.stringify("Id non valido",null,2));
    }
});
app.get('/getAll',urlencodedParser,function(req,res){
    res.end(JSON.stringify(dipendenti,null,2));
});
app.post('/insert',urlencodeJsonParser,function(req,res){
    let dipendente;
    if(!validazioni(req.body.nome,1)||!validazioni(req.body.cognome,2)||!validazioni(req.body.sesso,3)||!validazioni(req.body.luogoDiNascita,4)||!validazioni(req.body.dataDiNascita,5)||!validazioni(req.body.codiceFiscale,6)||!validazioni(req.body.ruoloAziendale,7)||!validazioni(req.body.stipendio,8)||!validazioni(req.body.titoloDiStudio,7)){
        res.end(JSON.stringify("Errore: hai inserito valori non validi",null,2));
    }else{
        dipendente = new dip(id++,req.body.nome,req.body.cognome,req.body.sesso,req.body.luogoDiNascita,req.body.dataDiNascita,req.body.codiceFiscale,req.body.ruoloAziendale,req.body.stipendio,req.body.titoloDiStudio);
        dipendenti.push(dipendente);
        res.end(JSON.stringify("Dipendente inserito con successo",null,2));
    }
    save();
});
app.put('/update',urlencodeJsonParser,function(req,res){
    let dipendente =[];
    //trovo l'indice
    let i;
    if(validazioni(req.body.id,0)){
        for(i = 0; i<dipendenti.length;i++){
            if(dipendenti[i].id==req.body.id){
                break;
            }
        }
        if(i!=dipendenti.length){
            //faccio i controlli e creo l'array
            if(req.body.nome.length!=0){
                if(validazioni(req.body.nome,1)){
                    dipendente.push(req.body.nome);
                }else{
                    res.end(JSON.stringify("Nome non valido",null,2));
                }
            }else{
                dipendente.push(dipendenti[i].nome);
            }
            if(req.body.cognome.length!=0){
                if(validazioni(req.body.cognome,2)){
                    dipendente.push(req.body.cognome);
                }else{
                    res.end(JSON.stringify("Cognome non valido",null,2));
                }
            }else{
                dipendente.push(dipendenti[i].cognome);
            }
            if(req.body.sesso!=undefined){
                
                if(validazioni(req.body.sesso,3)){
                    dipendente.push(req.body.sesso);
                }else{
                    res.end(JSON.stringify("Gender non valido",null,2));
                }
            }else{
                dipendente.push(dipendenti[i].sesso);
            }
            if(req.body.luogoDiNascita.length!=0){
                if(validazioni(req.body.luogoDiNascita,4)){
                    dipendente.push(req.body.luogoDiNascita);
                }else{
                    res.end(JSON.stringify("Luogo di nascita non valido",null,2));
                }
            }else{
                dipendente.push(dipendenti[i].luogoDiNascita);
            }
            if(req.body.dataDiNascita.length!=0){
                if(validazioni(req.body.dataDiNascita,5)){
                    dipendente.push(req.body.dataDiNascita);
                }else{
                    res.end(JSON.stringify("Data di nascita non valida",null,2));
                }
            }else{
                dipendente.push(dipendenti[i].dataDiNascita);
            }
            if(req.body.codiceFiscale.length!=0){
                if(validazioni(req.body.codiceFiscale,6)){
                    dipendente.push(req.body.codiceFiscale);
                }else{
                    res.end(JSON.stringify("Codice Fiscale non valido",null,2));
                }
            }else{
                dipendente.push(dipendenti[i].codiceFiscale);
            }
            if(req.body.ruoloAziendale.length!=0){
                if(validazioni(req.body.ruoloAziendale,7)){
                    dipendente.push(req.body.ruoloAziendale);
                }else{
                    res.end(JSON.stringify("Ruolo Aziendale non valido",null,2));
                }
            }else{
                dipendente.push(dipendenti[i].ruoloAziendale);
            }
            if(req.body.stipendio.length!=0){
                if(validazioni(req.body.stipendio,8)){
                    dipendente.push(req.body.stipendio);
                }else{
                    res.end(JSON.stringify("Stipendio non valido",null,2));
                }
            }else{
                dipendente.push(dipendenti[i].stipendio);
            }
            if(req.body.titoloDiStudio.length!=0){
                if(validazioni(req.body.titoloDiStudio,9)){
                    dipendente.push(req.body.titoloDiStudio);
                }else{
                    res.end(JSON.stringify("Titolo di studio non valido",null,2));
                }
            }else{
                dipendente.push(dipendenti[i].titoloDiStudio);
            }
            // fine controlli e inserimenti
            dipendenti[i] = new dip(req.body.id,dipendente[0],dipendente[1],dipendente[2],dipendente[3],dipendente[4],dipendente[5],dipendente[6],dipendente[7],dipendente[8]);          
            res.end(JSON.stringify("Dipendente modificato con successo",null,2));
            save();
        }else{
            res.end(JSON.stringify("Dipendente non trovato",null,2));
        }
    }else{
        res.end(JSON.stringify("Id non valido",null,2));
    }
});
app.delete('/:id/delete/',urlencodedParser,function(req,res){
    let id = req.params.id;
    let i;
    if(validazioni(id,0)){
        for( i = 0;i<dipendenti.length;i++){
            if(id==dipendenti[i].id){
               dipendenti.splice(i,1);
               res.end(JSON.stringify("Dipendente eliminato",null,2));
               save();
            }
        }
        if(i ==dipendenti.length){
            res.end(JSON.stringify("Dipendente non trovato",null,2));
        }
    }else{
        res.end(JSON.stringify("Id non valido",null,2));
    }
});
/*fine requests*/
app.listen(port, function () {
    console.log('listening on port:'+port);
});