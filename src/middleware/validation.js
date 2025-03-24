export const validation = (schema) => {
  return (req, res, next) => {
    // Only validate req.body by default
    const dataToValidate = req.body;
    
    let x = schema.validate(dataToValidate, { abortEarly: false });
    
    if (x.error) {
      res.status(422).json({ message: "Error", error: x.error.details });
    } else {
      next();
    }
  };
};

export const validationWithParams = (schema) => {
  return (req, res, next) => {
    // Validate both body and params
    const dataToValidate = { ...req.body, ...req.params };
    
    let x = schema.validate(dataToValidate, { abortEarly: false });
    
    if (x.error) {
      res.status(422).json({ message: "Error", error: x.error.details });
    } else {
      next();
    }
  };
};
