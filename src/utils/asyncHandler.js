// use of promisses

const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise    // create a promise used for async operations
      .resolve(requestHandler(req, res, next))
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
