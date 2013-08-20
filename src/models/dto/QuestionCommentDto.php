<?php

namespace models\dto;

use models\UserModel;
use models\TextModel;
use models\mapper\JsonEncoder;
use models\ProjectModel;
use models\QuestionModel;

class QuestionCommentDto
{
	/**
	 * Encodes a QuestionModel and related data for $questionId
	 * @param string $projectId
	 * @param string $questionId
	 * @param string $userId
	 * @return array - The DTO.
	 */
	public static function encode($projectId, $questionId, $userId) {
		$userModel = new UserModel($userId);
		$projectModel = new ProjectModel($projectId);
		
		$questionModel = new QuestionModel($projectModel, $questionId);
		$question = QuestionCommentDtoEncoder::encode($questionModel);
		
		$textId = $questionModel->textRef->asString();
		$textModel = new TextModel($projectModel, $textId);
		$text = JsonEncoder::encode($textModel);

		$dto = array();
		$dto['question'] = $question;
		$dto['text'] = $text;
		$dto['projectid'] = $projectId;
		$dto['rights'] = RightsHelper::encode($userModel, $projectModel);
		
		return $dto;
	}
	
	/**
	 * Encodes a $answerModel in the same method as returned by the 
	 * @param AnswerModel $answerModel
	 * @return array - The DTO.
	 */
	public static function encodeAnswer($answerModel) {
		$dto = QuestionCommentDtoEncoder::encode($answerModel);
		return $dto;
	}
	
}

?>