// use of promisses

const asyncHandler = (requestHandler) => {
  //high order function
 return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)) // create a promise used for async operations
      .catch((err) => next(err));
  };
};

export default asyncHandler;

//  try catch function

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req,res,next)
//   } catch (error) {
//     res.status(error.code || 500).send(
//       console.log("error", error).json({
//         succes: false,
//         message: err.message,
//       })
//     );
//   }
// };
