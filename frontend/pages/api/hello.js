// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  res.status(200).json(
    [
      {
        nickname: "John",
        message: "Hello, World!",
        time: `${new Date().getHours()}:${new Date().getMinutes()}`,
      },
    ]
  );
}
