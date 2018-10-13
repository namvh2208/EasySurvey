var app =  new Vue({
	el:"#main",
	data:{
		questions:[],
		selectedQuestion:null,
		questionCounter:0,
		jumpCounter:0
		
	},	
	
	methods:{
		isVisible: function(q)
		{
			if(q.visibility==null ||q.visibility=="")
				return true;

			return eval(q.visibility);
		},
			
		isEnable: function(q)
		{
			if(q.enable==null ||q.enable=="")
				return true;

			return eval(q.enable);
		},
		
		shortType: function(type)
		{
			switch(type)
			{
				case "ShortAnswer": return "SA";
				case "LongAnswer": return "LA";
				case "Multiple": return "M";
				case "Radio": return "R";
				case "YesNo": return "YN";
			}
			
		},
		
		compileString: function(str)
		{
			if(isEmptyString(str))
				return str;
			
			let regex = /{(.*?)}/g;
			
			
			
			return str.replace(regex, (match, qid) => {
				for(let i=0; i<this.questions.length; i++)
				{
					let question = this.questions[i];
					if(question.id == qid)
					{
						let blankTemplate = "<span onClick='scrollToQuestion("+qid+")' class='blank' title='"+question.caption+"'></span>";
						
						
						if(["Multiple", "Radio"].includes(question.type))
							return app.questions[i].answers.join(",");
						
						return isEmptyString(app.questions[i].answer)?blankTemplate:app.questions[i].answer;
					}
				}
				
				throw "invalid question id " + qid + " in visibility rule of question #" + q.id;
			});
		},
		
		getNextQuestion: function(q)
		{
			var currentQuestion=q;
			
			
			//first check the jump condtions of selected question
			//if there is match jump condtion, evaluate the jump question's enable and visibility rule
			//	if valid then return the question, else check the nest questionjump to the approriate question
			
			//else, find the next question in this.questions array, evaluate the enable and visibility rule
			//	if valid then return the question, else check the nest question
			

			for(let i = 0; i<currentQuestion.jumps.length; i++)
			{
				let jump = currentQuestion.jumps[i];
				let jumpEval = eval(jump.expression);
				
				console.log(i + " - " +jumpEval);
				
				if(jumpEval==true)
				{
					//TODO - validate if jumpTo is a valid number
					let tempQuestion = this.getQuestionById(jump.jumpTo);
					
					if(this.isEnable(tempQuestion) && this.isVisible(tempQuestion))
					{
						return tempQuestion;
						break;
					}
					else
					{
						console.log("ERROR: question "+tempQuestion.id+" is not enable or visible");
						break;
					}
				}
			}
		

			let currentQuestionIndex  = this.questions.indexOf(currentQuestion);
			
			while(++currentQuestionIndex < this.questions.length)
			{
				let tempQuestion = this.questions[currentQuestionIndex];
				if(this.isEnable(tempQuestion) && this.isVisible(tempQuestion))
				{
					return tempQuestion;
					break;
				}
			}
			
	
			return null;
		},
		
		moveToNextQuestion: function(q)
		{			
			let nextQuestion = this.getNextQuestion(q);
			if(nextQuestion!=null)
			{
				this.selectedQuestion = nextQuestion;
				//console.log(nextQuestion.id);
				
				scrollToQuestion(nextQuestion.id);
				
			}
		},
		
		getQuestionById: function(id)
		{
			var filter = this.questions.filter(x=>x.id==id);
			if(filter.length>0)
				return filter[0];
			
			throw "invalid question id " + id;
		},
		
		questionId2Index: function(id)
		{
			for(let i = 0; i<this.questions.length; i++)
			{
				if(this.questions.id == id)
					return i;
			}
			
			throw "invalid question id " + id;
		},
		scrollToQuestion: function(qid)
		{			
			scrollToQuestion(qid);
		}
	}
	
	
});


$(document).ready(function(){
	$.get("questions.json", function(data){
		app.questions = data.questions;
		app.selectedQuestion = data.selectedQuestion;
		app.questionCounter = data.questionCounter;
		app.jumpCounter = data.jumpCounter;
		app.settings = {};
		
		
		
		app.$nextTick(function(){
			scrollToQuestion(0);
			
		})
		
		
	})
	
})



//CUSTOM FUNCTIONS
function isEmptyString(str)
{
	return str == null || str == '' || str == undefined;
}

function scrollToQuestion(qid)
{

	let question = $("#question_"+qid);
	let offset = ($(document).height() - question.height() - 32)/2;
	$("#placeholder").scrollTo(question, 500, {
		offset:-offset
	});
	
	$("#placeholder > .active").removeClass("active");
	question.addClass("active");
	
	return false;
}
