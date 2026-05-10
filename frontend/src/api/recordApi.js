import API from "./axios";

export const getRecords = async () => {
  return API.get("/records");
};

export const createRecord = async (data) => {
  return API.post("/records", data);
};

export const updateRecord = async (id, data) => {
  return API.put(`/records/${id}`, data);
};

export const deleteRecord = async (id) => {
  return API.delete(`/records/${id}`);
};
