<?php

namespace models\commands;

use models\scriptureforge\dto\UsxTrimHelper;
use models\commands\ActivityCommands;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\ProjectModel;
use models\TextModel;

class TextCommands
{
	
	private static function hasRange($object) {
		if (isset($object['startCh'])) {
			$sc = (int)$object['startCh'];
		} else {
			$sc = 0;
		}
		if (isset($object['startVs'])) {
			$sv = (int)$object['startVs'];
		} else {
			$sv = 0;
		}
		if (isset($object['endCh'])) {
			$ec = (int)$object['endCh'];
		} else {
			$ec = 0;
		}
		if (isset($object['endVs'])) {
			$ev = (int)$object['endVs'];
		} else {
			$ev = 0;
		}
		return ($sc || $sv || $ec || $ev);
	}

	/**
	 * @param string $projectId
	 * @param JSON $object
	 * @return ID of text updated/added
	 */
	public static function updateText($projectId, $object) {
		$projectModel = new \models\ProjectModel($projectId);
		$textModel = new \models\TextModel($projectModel);
		$isNewText = ($object['id'] == '');
		if (!$isNewText) {
			$textModel->read($object['id']);
		}
		JsonDecoder::decode($textModel, $object);
		if (TextCommands::hasRange($object)) {
			$usxTrimHelper = new UsxTrimHelper(
				$textModel->content,
				$object['startCh'],
				$object['startVs'],
				$object['endCh'],
				$object['endVs']
			);
			$textModel->content = $usxTrimHelper->trimUsx();
		}
		$textId = $textModel->write();
		if ($isNewText) {
			ActivityCommands::addText($projectModel, $textId, $textModel);
		}
		return $textId;
	}
	
	/**
	 * 
	 * @param string $projectId
	 * @param string $textId
	 */
	public static function readText($projectId, $textId) {
		$projectModel = new \models\ProjectModel($projectId);
		$textModel = new \models\TextModel($projectModel, $textId);
		return JsonEncoder::encode($textModel);
	}

	/**
	 * @param string $projectId
	 * @param array $textIds
	 * @return int Total number of texts archived.
	 */
	public static function archiveTexts($projectId, $textIds) {
		$project = new ProjectModel($projectId);
		$count = 0;
		foreach ($textIds as $textId) {
			$text = new TextModel($project, $textId);
			$text->isArchived = true;
			$text->write();
			$count++;
		}
		return $count;
	}

	/**
	 * @param string $projectId
	 * @param array $textIds
	 * @return int Total number of texts removed.
	 */
	public static function deleteTexts($projectId, $textIds) {
		$projectModel = new ProjectModel($projectId);
		$count = 0;
		foreach ($textIds as $textId) {
			TextModel::remove($projectModel->databaseName(), $textId);
			$count++;
		}
		return $count;
	}
	
}

?>
