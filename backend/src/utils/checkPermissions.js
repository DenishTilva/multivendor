const checkPermissions = (permissions, data) => {
  const filteredData = {};

  Object.keys(data).forEach((key) => {
    if (permissions[key]) {
      filteredData[key] = data[key];
    }
  });

  return filteredData;
};

module.exports = checkPermissions;
