import app from "app.js";




app.listen(process.env.PORT,()=>{
    console.log(`JOB SERVICE IS RUNNING ON ${process.env.PORT}`);
});