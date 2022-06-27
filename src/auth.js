import crypto from "crypto";

const authenticate = () => (req, res, next) => {
  if (
    req.header("X-API-KEY") !== process.env.API_KEY &&
    !req.header("X-Hub-Signature-256")
  ) {
    return res.sendStatus(401);
  }

  const githubSignature = req.header("X-Hub-Signature-256");
  if (!!githubSignature) {
    const expectedSignature =
      "sha256=" +
      crypto
        .createHmac("sha256", process.env.API_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");

    if (githubSignature !== expectedSignature) {
      return res.status(401).send("Signature not matching");
    }
  }

  next();
};

export default authenticate;
