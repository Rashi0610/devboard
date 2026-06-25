import crypto from 'crypto'
import GithubintegrationModel from '../models/GithubIntegration.model.js';
import TaskModel from '../models/Task.model.js';
import columnModel from '../models/Column.model.js'


export const verifyWebhookSignature =async(req)=> {
    const reqSignature = req.headers['x-hub-signature-256'];
    const severSignature=crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET).update(req.body).digest('hex')
    return crypto.timingSafeEqual(
        Buffer.from(reqSignature),
        Buffer.from(`sha256=${severSignature}`)

    );
}

export const handlePullRequest = async(payload)=>{
    const {action} =payload ;
    console.log('Repo owner:', payload.repository.owner.login)
console.log('Repo name:', payload.repository.name)
   const githubIntegration =await GithubintegrationModel.findOne({repoOwner:payload.repository.owner.login ,
    repoName :payload.repository.name  })
      console.log('Integration found:', githubIntegration)
   if(!githubIntegration) return;

   if(action === 'opened'){
    await TaskModel.create({
        title:payload.pull_request.title ,
        column:githubIntegration.defaultColumnId,
        githubPrUrl:payload.pull_request.html_url,
         project: githubIntegration.project,
         createdBy: githubIntegration.project,
         position : 0
    })
     console.log('Task created successfully')
   }
   if(action === 'closed' && payload.pull_request.merged === true ){
    const task = await  TaskModel.findOneAndUpdate({githubPrUrl:payload.pull_request.html_url},{column:githubIntegration.doneColumnId})
   }
}