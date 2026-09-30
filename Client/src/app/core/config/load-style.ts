// Custom hook for theme setup
export default () => {
  const stylesheets = {
    'font-plus-jakarta-sans':
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap',
    'font-playfair-display':
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap',
    theme: '/assets/styles/theme.css',
    glightbox: '/assets/library/glightbox/glightbox.min.css',
  };
  const loadStyle = ({ id, url }: { id: string; url: string }): void => {
    const placeholder = document.getElementById(id + '-placeholder-stylesheet');
    if (placeholder?.parentNode) {
      const newLink = document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = url;
      placeholder.parentNode.replaceChild(newLink, placeholder);
    }
  };

  Object.entries(stylesheets).forEach(([id, url]) => loadStyle({ id, url }));
};
