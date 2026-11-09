/** Public values only. Never place secrets in VITE_ variables. */
export const profile = {
  name: 'Dušan Janković',
  linkedin: 'https://www.linkedin.com/in/dusanjnkvc/',
  publicEmail: import.meta.env.VITE_PUBLIC_EMAIL || '',
  logenUrl: import.meta.env.VITE_LOGEN_URL || '',
  portrait: `${import.meta.env.BASE_URL}portrait.jpg`,
  resume: `${import.meta.env.BASE_URL}Dusan-Jankovic-CV.pdf`,
};

