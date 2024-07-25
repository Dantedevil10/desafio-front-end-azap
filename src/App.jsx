import { useEffect,useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

import './App.css';

function App() {
  const API = 'https://homologacao3.azapfy.com.br/api/ps/metahumans'
  const [dados,setDados] = useState([]);
  const [pesquisar, setPesquisar] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [open, setOpen] = useState(false);

  const filteredDados = pesquisar ? dados.filter((dado) =>
  dado.name.toLowerCase().includes(pesquisar.toLowerCase())) : dados;

  const EscolherPersonagem = (dado) => {
    if (selectedCharacters.includes(dado)) {
      setSelectedCharacters(selectedCharacters.filter(character => character !== dado));
    } else if (selectedCharacters.length < 2) {
      setSelectedCharacters([...selectedCharacters, dado]);
    }
  };

  //Funções DIALOG MaterialUI
  const handleFinalize = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedCharacters([]);
  };

  const getWinner = () => {
    if (selectedCharacters.length === 2) {
      return selectedCharacters[0].powerstats.power > selectedCharacters[1].powerstats.power ? selectedCharacters[0].name : selectedCharacters[1].name;
    }
    return null;
  };

  //Consumindo A API com cache
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setDados(data);
        localStorage.setItem('metahumans', JSON.stringify(data));
        // Cache images
        const cache = await caches.open('metahumans-images');
        data.forEach(dado => {
          cache.add(dado.images.sm);
        });
      } catch (error) {
        console.error('Failed to fetch data, loading from localStorage', error);
        const localData = localStorage.getItem('metahumans');
        if (localData) {
          setDados(JSON.parse(localData));
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <header>
        <div id='fd'>
          <input value={pesquisar} onChange={(e) => setPesquisar(e.target.value)} id='pb' type='text' placeholder='Pesquise Seu Personagem' />
        </div>
        <div id='dib'>
          {selectedCharacters.length === 2 && (
            <button id='bf' onClick={handleFinalize}>Finalizar Seleção</button>
          )}
        </div>
      </header>
      <main>
        <div className='container'>
          {filteredDados.length > 0 ? (filteredDados.map((dado) => (
            <div id='content' key={dado.id} onClick={() => EscolherPersonagem(dado)}
            style={{ border: selectedCharacters.includes(dado) ? '2px solid blue' : 'none' }}>

              <img style={{ borderRadius: '5px' }} src={dado.images.sm} alt='' />
              <p>{dado.name}</p>
            </div>
          ))) : (<h1>Sem Conteúdo</h1>)
          }
        </div>

      </main>

      <Dialog open={open} onClose={handleClose} >
        <DialogTitle>Resultado</DialogTitle>
        <DialogContent id='pop'>
          <div id='dc'>
            <span>
              <img style={{ borderRadius: '5px' }} src={selectedCharacters[0]?.images.sm} alt='' />
              <p> {selectedCharacters[0]?.name} | Poder De Força : {selectedCharacters[0]?.powerstats.power}</p>
            </span>
            <span>
              <img style={{ borderRadius: '5px' }} src={selectedCharacters[1]?.images.sm} alt='' />
              <p> {selectedCharacters[1]?.name} | Poder De Força : {selectedCharacters[1]?.powerstats.power}</p>
            </span>
          </div>
          <p>Vencedor: {getWinner()}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" className="custom-button">Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;
