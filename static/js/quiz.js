const ques = [
 {
    Q: 'Why did the hare stop in the middle of the race?',
    options: ['He was tired','He wanted to eat','He thought he was much faster and decided to rest','He got lost']

 },
{
    Q: 'Who won the race in the end?',
    options: ['The hare','The tortoise','Both tied','The fox']

},
{
    Q: 'What value do we learn from the story?',
    options: ['Slow and steady wins the race','Fast is always best','Don’t listen to others','Sleeping makes you strong' ]
},
{
    Q: 'You have completed the quiz successfully 🥳',
    options: []
}
]

const ans = ['He thought he was much faster and decided to rest','The tortoise','Slow and steady wins the race'];

const question = document.querySelector('#ques');
const next = document.querySelector('#nxt');
const opt = document.querySelectorAll('.box2');
const tryagn = document.querySelector('.tryagain');



let m=0;

next.addEventListener('click', ()=>{
    m+=1;
    quiz();
    if(m== ques.length-1){
        document.querySelector('.ans').style.display = 'none';
        next.style.display = 'none';
        document.querySelector('.heading').style.display = 'none';
    }
})

function quiz(){
    question.innerHTML = ques[m].Q;
    for(let i=0; i< opt.length; i++){
        opt[i].innerHTML= ques[m].options[i];
        opt[i].parentElement.style.backgroundColor = 'rgba(230, 230, 250, 0.9)';
        next.style.display ='none';
    }

    for(item of opt){
        item.addEventListener('click', (e)=>{
            let value = e.target.innerText;

            if(value == ans[m]){
                e.target.parentElement.style.backgroundColor = '#90EE90';
                next.style.display = 'flex';       
            }
            else{
                document.querySelector('.box').style.display = 'none';
                e.target.parentElement.style.backgroundColor = 'red';
                document.querySelector('.win').style.display = 'block';
                document.querySelector('.tryagain').style.display = 'flex';
            }
        })
    }
}
tryagn.addEventListener('click',()=>{
    location.reload(true);
})



quiz();