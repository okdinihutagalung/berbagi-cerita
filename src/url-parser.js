export const parseRequestURL = () => {
  const url = location.hash.slice(1).toLowerCase() || '/';
  const r = url.split('/');
  return {
    resource: r[1] || null,
    id: r[2] || null,
    verb: r[3] || null
  };
};
