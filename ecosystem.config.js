module.exports = {
  apps: [
    {
      name: "nucleus-server",
      script: "index.js",
      env_production: {
        NODE_ENV: "production",
        AWS_S3_REGION: "ap-south-1",
        AWS_S3_BUCKETNAME: "sunny-nucleus",
        AWS_S3_FILES_FOLDER: "Files",
        MAX_FILE_SIZE: 200,
        PORT: 80,
      },
      env_development: {
        NODE_ENV: "development",
        AWS_S3_REGION: "ap-south-1",
        AWS_S3_BUCKETNAME: "sunny-nucleus",
        AWS_S3_FILES_FOLDER: "Files",
        MAX_FILE_SIZE: 200,
        PORT: 3000,
      },
      watch: true,
    },
  ],

  // Deployment Configuration
  deploy: {
    production: {
      user: "ubuntu",
      host: ["15.207.71.30"],
      ref: "origin/master",
      repo: "git@github.com:Prashanth-Kumar-N/nucleus-node.git",
      path: "/var/www/my-repository",
      "post-deploy":
        "npm i && pm2 startOrRestart ecosystem.json --env production",
    },
  },
};
