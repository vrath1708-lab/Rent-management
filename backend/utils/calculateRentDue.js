// small helper to calculate if rent is late
export const isLate = (dueDate) => {
  const now = new Date();
  return new Date(dueDate) < new Date(now.setHours(0,0,0,0));
};
