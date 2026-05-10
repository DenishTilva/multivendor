import API from "./axios";

export const getUsers = async () => {
  return API.get("/users");
};

export const getStaffUsers = async () => {
  return API.get("/users/staff");
};

export const createUser = async (data) => {
  return API.post("/users/create", data);
};

export const deleteUser = async (id) => {
  return API.delete(`/users/${id}`);
};
