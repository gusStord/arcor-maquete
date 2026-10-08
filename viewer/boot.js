// Keep this outside the module graph: missing imports must produce a useful error.
const message = document.querySelector('#loading-message');
window.showMaquetteError = (error) => {
  console.error(error);
  document.querySelector('#loading').hidden = false;
  message.textContent = location.protocol === 'file:'
    ? 'Abra a maquete pelo site publicado ou execute ABRIR_VISUALIZADOR.py. O 3D não abre diretamente pelo arquivo HTML.'
    : 'Não foi possível abrir o 3D. Tente novamente ou veja as imagens da maquete.';
  document.querySelector('#loading-actions').hidden = false;
  document.querySelector('#status').textContent = '3D indisponível · galeria disponível';
};
document.querySelector('#retry').onclick = () => location.reload();
if (location.protocol === 'file:') window.showMaquetteError(new Error('HTTP is required for ES modules'));
else import('./viewer.mjs?v=ambientada-2').catch(window.showMaquetteError);
