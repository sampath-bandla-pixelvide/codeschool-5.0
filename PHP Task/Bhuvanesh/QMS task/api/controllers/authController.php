<?php
require __DIR__ . "/../utils/db.php";
require __DIR__ . "/../utils/function.php";

class authController {
    public $db = NULL;

    function __construct() {
        $this->db = new DB();
    }

  
    function verifyEmail($email) {
        $user = $this->db->query("SELECT * FROM users WHERE email = :email AND is_active = TRUE")->first([":email" => $email]);

        if ($user) {
        return sendResponse(true, "Email found", "success");
        }
        return sendResponse(false, "User not found");
    }

    function verifyLogin($email, $password) {
        $hashed = md5($password);
        $user = $this->db->query(
        "SELECT id, role_id FROM users WHERE email = :email AND password = :password"
        )->first([":email" => $email, ":password" => $hashed]);

        if (!$user) {
        return sendResponse(false, "Login Failed");
        }

        $token = generateRandomString(15);
        date_default_timezone_set('Asia/Kolkata');
        $expireAt = date('Y-m-d H:i:s', strtotime('+60 minutes'));


        $this->db->query(
        "INSERT INTO user_tokens(token,user_id,expires_at) VALUES(:token,:user_id,:expires_at)"
        )->execute([":token" => $token, ":user_id" => $user['id'], ":expires_at" => $expireAt]);

        return sendResponse(true, "Login Successful", [
        "role_id" => $user['role_id'],
        "token"   => $token
        ]);
    }


  function authToken($token) {
        $user = $this->db->query(
            "SELECT ut.*, u.* 
             FROM user_tokens ut 
             INNER JOIN users u ON ut.user_id = u.id  
             WHERE ut.token = :token AND ut.is_active = TRUE AND ut.expires_at > NOW()"
        )->first([":token" => $token]);

        if (!$user) {
            $exists = $this->db->query(
                "SELECT * FROM user_tokens WHERE token = :token"
            )->first([":token" => $token]);

            if ($exists) {
                $this->db->query(
                    "UPDATE user_tokens SET is_active = FALSE WHERE token = :token"
                )->execute([":token" => $token]);
                return sendResponse(false, "Session Expired");
            }
            return sendResponse(false, "Invalid Token");
        }
        return sendResponse(true, "Authorized", $user);
    }




    function userToken($token) {
        $user = $this->db->query(
            "SELECT u.name, u.email, u.role_id 
             FROM user_tokens ut 
             INNER JOIN users u ON ut.user_id = u.id  
             WHERE ut.token = :token AND ut.is_active = TRUE AND ut.expires_at > NOW()"
        )->first([":token" => $token]);

        if (!$user) {
            $exists = $this->db->query(
                "SELECT * FROM user_tokens WHERE token = :token"
            )->first([":token" => $token]);

            if ($exists) {
                $this->db->query(
                    "UPDATE user_tokens SET is_active = FALSE WHERE token = :token"
                )->execute([":token" => $token]);
                return sendResponse(false, "Session Expired");
            }
            return sendResponse(false, "Invalid Token");
        }
        return sendResponse(true, "Authorized", $user);
    }


    function logout($token) {
        $user = $this->db->query("SELECT user_id FROM user_tokens WHERE token = :token")
                         ->first([":token" => $token]);
        if (!$user) return sendResponse(false, "Logout Failed");

        $this->db->query("UPDATE user_tokens SET is_active = FALSE WHERE user_id = :user_id")
                 ->update([":user_id" => $user['user_id']]);
        return sendResponse(true, "Logout Successful");
    }
    function auth($token) {
        $user = $this->db->query("
        SELECT u.* 
        FROM user_tokens ut 
        INNER JOIN users u ON ut.user_id = u.id  
        WHERE ut.token = :token 
        AND ut.is_active = TRUE 
        AND ut.expires_at > NOW()
        ")->first([":token" => $token]);
        if($user){
        if ($user['role_id'] === 1) {
        return true;  
        }
        return false;
        }   
        return false; 
    }

    function getSubjects($token){
        $check = $this->userAuth($token);
        if (!$check) {
        return sendResponse(false,"token issue");
        }
        $selectQuery = "SELECT id, name from subjects";
     $result = $this->db->query($selectQuery)->get();
     return sendResponse(true,"success",$result);
    }

    function addSubject($token, $subject_name){
      $check = $this->auth($token);
        if (!$check) {
        return sendResponse(false,"Admin Access only");
        }
        if(empty($subject_name)){
        return sendResponse(false,"new subject name should not be empty");
        }
        $insertQuery = "insert into subjects (name) values (:subject_name)";
        $result = $this->db->query($insertQuery)->create([":subject_name"=>$subject_name]);
        if ($insertQuery){
        return sendResponse(true,"inserted");
        }
        return sendResponse(false,"Database Error");
    }   

    function deleteSubject($token, $delete){
     $check = $this->auth($token);
        if (!$check) {
            return sendResponse(false,"Admin Access only");       
             }
        $deleteQuery = "delete from subjects where id = :subject_id ";
        $result = $this->db->query($deleteQuery)->delete([":subject_id"=>$delete]);
        if ($result){
        return sendResponse(true,"deleted");
        }
        return sendResponse(false,"Database Error");
    }
    function editSubjects($token,$name,$subject_id){
        $check = $this->auth($token);
        if (!$check) {
        return sendResponse(false,"Admin Access only");        }
        if(empty($subject_id ) || empty($name)){
            return sendResponse(false,"new subject name should not be empty");
        }
        $updateQuery = "Update subjects set name = :name where id = :subject_id RETURNING id";
        $updateStatus = $this->db->query($updateQuery)->update([":name"=>$name,":subject_id"=>$subject_id]);
        if($updateStatus !== false){
        return sendResponse(true,"update SuccessFull");
        }
        return sendResponse(false,"Database Error");
    }


    function getQuizzes($token, $subject = "") {
        $check = $this->userAuth($token);
        if (!$check) {
                return sendResponse(false,"token issue");  
                     }

        if (empty($subject)) {
            $selectQuery = "SELECT q.id, q.title, s.name AS subject_name, 
                               q.duration_minutes, q.total_marks 
                        FROM quizzes q 
                        INNER JOIN subjects s ON s.id = q.subject_id
                        ORDER BY q.id";
             $result = $this->db->query($selectQuery)->get();
             return sendResponse(true, $result ? "Quizzes fetched" : "No quizzes found", $result ?? []);
         }

        $selectQuery = "SELECT q.id, q.title, s.name AS subject_name, 
                           q.duration_minutes, q.total_marks 
                    FROM quizzes q 
                    INNER JOIN subjects s ON s.id = q.subject_id 
                    WHERE s.name = :subject
                    ORDER BY q.id";
        $result = $this->db->query($selectQuery)->get([":subject" => $subject]);
        return sendResponse(true, $result ? "Quizzes fetched" : "No quizzes found", $result ?? []);
    }
 
    function addQuiz($token, $title, $duration, $marks, $subject) {
        $check = $this->auth($token);
        if (!$check) {
        return sendResponse(false,"Admin Access only");
        }

        if (empty($title) || empty($duration) || empty($marks) || empty($subject)) {
        return sendResponse(false, "All fields must be filled (including subject)");
        }

        $selectQuery = "SELECT id FROM subjects WHERE name = :subject";
        $subjectRow = $this->db->query($selectQuery)->first([":subject" => $subject]);
        if (!$subjectRow) {
            return sendResponse(false, "Subject not found");
        }

        $subject_id = $subjectRow['id'];

        $insertQuery = "INSERT INTO quizzes (title, duration_minutes, subject_id, total_marks) 
                        VALUES (:title, :duration, :subject_id, :marks) RETURNING id";
        $newQuiz = $this->db->query($insertQuery)->first([
        ":title" => $title,
        ":duration" => $duration,
        ":subject_id" => $subject_id,
        ":marks" => $marks
         ]);

        if ($newQuiz) {
        return sendResponse(true, "Quiz inserted successfully",$newQuiz);
        }
        return sendResponse(false, "Database Error");
    }
    function editQuiz($token, $quiz_id, $title, $duration, $marks) {
        $check = $this->auth($token);
        if (!$check) {
        return sendResponse(false,"Admin Access only");
        }
        if (empty($quiz_id) || empty($title) || empty($duration) || empty($marks)) {
        return sendResponse(false, "All fields are required");
        }

        $updateQuery = "UPDATE quizzes 
                    SET title = :title, duration_minutes = :duration, total_marks = :marks, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = :quiz_id RETURNING id";
        $updateStatus = $this->db->query($updateQuery)->update([
        ":title" => $title,
        ":duration" => $duration,
        ":marks" => $marks,
        ":quiz_id" => $quiz_id
        ]);

        if ($updateStatus !== false) {
        return sendResponse(true, "Quiz updated successfully");
        }
        return sendResponse(false, "Database Error");
    }

    function deleteQuiz($token, $delete){
        $check = $this->auth($token);
        if (!$check) {
        return sendResponse(false,"Admin Access only");
        }
        $deleteQuery = "delete from quizzes where id = :delete ";
        $result = $this->db->query($deleteQuery)->delete([":delete"=>$delete]);
        if ($result){
            return sendResponse(true,"deleted");
        }
        return sendResponse(false,"Database Error");
    }

    function getQuestions($token, $quizId){
        $check = $this->userAuth($token);
        if (!$check) {
            return sendResponse(false,"token issue");
        }
        $selectQuery = "SELECT q.id, q.question_text, q.marks 
              FROM questions q 
              WHERE q.quiz_id = :qid 
              ORDER BY q.id";
        $result = $this->db->query($selectQuery)->get([":qid"=>$quizId]);
     
            if(empty($result)){
            return sendResponse(true,'not found anything! add',$result);
            }
            if($result){
            return sendResponse(true,"success",$result);
        }
            return sendResponse(false,"Database Error");
    }
    function addQuestion($token, $quiz_id, $text, $marks){
        $check = $this->auth($token);
        if (!$check) {
        return sendResponse(false,"Admin Access only");
        }
        if (empty($quiz_id) || empty($text) || empty($marks)) {
        return sendResponse(false, "All fields must be filled (including subject)");
        }

        $insertQuery = "INSERT INTO questions (quiz_id, question_text, marks) 
                    VALUES (:quiz_id, :question_text, :marks) RETURNING id";

        $newQuestion = $this->db->query($insertQuery)->first([
        ":quiz_id" => $quiz_id,
        ":question_text" => $text,
        ":marks" => $marks
        ]);

        if ($newQuestion) {
        return sendResponse(true, "Question inserted successfully", $newQuestion);
        }
        return sendResponse(false, "Database Error");
    }
    function editQuestion($token, $question_id, $text, $marks) {
        $check = $this->auth($token);
        if (!$check) {
        return sendResponse(false,"Admin Access only");
        }
        if (empty($question_id) || empty($text) || empty($marks)) {
        return sendResponse(false, "Question text and marks are required");
        }

        $updateQuery = "UPDATE questions 
                    SET question_text = :text, marks = :marks 
                    WHERE id = :question_id RETURNING id";
        $updateStatus = $this->db->query($updateQuery)->update([
        ":text" => $text,
        ":marks" => $marks,
        ":question_id" => $question_id
        ]);

        if ($updateStatus !== false) {
        return sendResponse(true, "Question updated successfully");
        }
        return sendResponse(false, "Database Error");
    }

    function deleteQuestion($token, $delete){
     $check = $this->auth($token);
        if (!$check) {
        return sendResponse(false,"Admin Access only");
        }
         $deleteQuery = "delete from questions where id = :delete ";
         $result = $this->db->query($deleteQuery)->delete([":delete"=>$delete]);
         if ($result){
        return sendResponse(true,"deleted");
        }
        return sendResponse(false,"Database Error");
    }
    function getOptions($token, $qid){
        $check = $this->userAuth($token);
        if (!$check) {
       return sendResponse(false,"token issue");
        }
     $selectQuery = "SELECT o.id, o.option_text 
              FROM options o 
              WHERE o.question_id = :qid 
              ORDER BY o.id";
     $result = $this->db->query($selectQuery)->get([":qid"=>$qid]);
     
        if(empty($result)){
           return sendResponse(true,'not found anything! add',$result);
        }
        if($result){
        return sendResponse(true,"success",$result);
     }
        return sendResponse(false,"Database Error");
    }
    function addOption($token, $question_id, $text, $is_correct){
        $check = $this->auth($token);
        if (!$check) {
        return sendResponse(false,"Admin Access only");
        }

        if ($question_id === null || $text === "" || $is_correct === null) {
        return sendResponse(false, "All fields must be filled");
        }

        if ($is_correct == "true" || $is_correct == 1) {
        $resetQuery = "UPDATE options 
                       SET is_correct = false 
                       WHERE question_id = :qid";

        $this->db->query($resetQuery)->update([
            ":qid" => $question_id
        ]);
        }

        $insertQuery = "INSERT INTO options (question_id, option_text, is_correct) 
                    VALUES (:question_id, :option_text, :is_correct) RETURNING id";

        $newOption = $this->db->query($insertQuery)->first([
        ":question_id" => $question_id,
        ":option_text" => $text,
        ":is_correct" => $is_correct
        ]);

        if ($newOption) {
        return sendResponse(true, "Option added successfully", $newOption);
        }

        return sendResponse(false, "Database Error");
    }
    
    function editOption($token, $option_id, $text, $is_correct) {
        $check = $this->auth($token);
        if (!$check) {
       return sendResponse(false,"Admin Access only");
        }

        $force = $_POST['force'] ?? false;

        $getQuery = "SELECT question_id FROM options WHERE id = :id";
        $option = $this->db->query($getQuery)->first([":id" => $option_id]);

        if (!$option) {
        return sendResponse(false, "Option not found");
        }

        $question_id = $option['question_id'];

 
        if (($is_correct == "true" || $is_correct == 1) && !$force) {

        $checkQuery = "SELECT id FROM options 
                       WHERE question_id = :qid AND is_correct = true";

        $exists = $this->db->query($checkQuery)->first([":qid"=>$question_id]);

        if ($exists) {
            return sendResponse(false, "Correct option already exists. Confirmation required.");
        }
        }

        if ($is_correct == "true" || $is_correct == 1) {
        $this->db->query("UPDATE options 
                          SET is_correct = false 
                          WHERE question_id = :qid")
                 ->update([":qid" => $question_id]);
        }

        $updateQuery = "UPDATE options 
                    SET option_text = :text, is_correct = :is_correct 
                    WHERE id = :option_id RETURNING id";

        $updateStatus = $this->db->query($updateQuery)->update([
        ":text" => $text,
        ":is_correct" => $is_correct,
        ":option_id" => $option_id
        ]);

        return $updateStatus !== false
        ? sendResponse(true, "Option updated successfully")
        : sendResponse(false, "Database Error");
    }

    function checkCorrectOption($token, $question_id){
    $check = $this->auth($token);
    if (!$check) {
        return sendResponse(false,"Admin Access only");
    }

    $query = "SELECT id FROM options 
              WHERE question_id = :qid AND is_correct = true";

    $result = $this->db->query($query)->first([":qid"=>$question_id]);

    return sendResponse(true, "checked", [
        "exists" => $result ? true : false
    ]);
    }

   function deleteOption($token, $delete){
    $check = $this->auth($token);
    if (!$check) {
        return sendResponse(false,"Admin Access only");
    }

    $deleteQuery = "DELETE FROM options WHERE id = :delete";
    $result = $this->db->query($deleteQuery)->delete([":delete"=>$delete]);

    if ($result !== false){
        return sendResponse(true,"deleted");
    }

    return sendResponse(false,"Database Error");
}

    function getCounts($token) {
    $check = $this->auth($token);
    if (!$check) {
        
       return sendResponse(false,"Admin Access only");
    }

    $q = "SELECT 
            COALESCE((SELECT COUNT(*) FROM users),0) AS users,
            COALESCE((SELECT COUNT(*) FROM subjects),0) AS subjects,
            COALESCE((SELECT COUNT(*) FROM quizzes),0) AS quizzes,
            COALESCE((SELECT COUNT(*) FROM questions),0) AS questions,
            COALESCE((SELECT COUNT(*) FROM attempts),0) AS attempts";

    $result = $this->db->query($q)->first();

    $data = [
        "users"     => $result['users'] ?? 0,
        "subjects"  => $result['subjects'] ?? 0,
        "quizzes"   => $result['quizzes'] ?? 0,
        "questions" => $result['questions'] ?? 0,
        "attempts"  => $result['attempts'] ?? 0
    ];

    return sendResponse(true, "Counts retrieved", $data);
    }
    function userAuth($token){
        $user = $this->db->query("
        SELECT u.* 
        FROM user_tokens ut 
        INNER JOIN users u ON ut.user_id = u.id  
        WHERE ut.token = :token 
        AND ut.is_active = TRUE 
        AND ut.expires_at > NOW()
        ")->first([":token" => $token]);
        if($user){
            return true;
        }
        return false;
    }

    function getQuizById($token,$subject_id){
        $check = $this->userAuth($token);
        if (!$check) {
        return sendResponse(false,"token Issue");
        }
        $selectQuery = "SELECT q.id, q.title,  
                           q.duration_minutes, q.total_marks 
                    FROM quizzes q WHERE q.subject_id = :subject";
        $result = $this->db->query($selectQuery)->get([":subject" => $subject_id]);
            if($result){
        return sendResponse(true,"retrieved",$result);
        }
        return SendResponse(false,"Database Error");
    }

    function getQuestionsById($token,$quiz_id){
        $check = $this->userAuth($token);
        if (!$check) {
        return sendResponse(false,"token Issue");
        }
        $selectQuery = "  SELECT q.id AS question_id, q.question_text, o.id AS option_id, o.option_text AS option_text
            FROM questions q
            INNER JOIN options o ON q.id = o.question_id
            WHERE q.quiz_id = :quiz_id
            ORDER BY q.id, o.id";
        $result = $this->db->query($selectQuery)->get([":quiz_id" => $quiz_id]);
     if($result){
        return sendResponse(true,"retrieved",$result);
        }
        return SendResponse(false,"Database Error");
    }


    function submitQuiz($token, $quiz_id, $answers, $startedAt) {

        $check = $this->userAuth($token);
        if (!$check) {
        return sendResponse(false, "Token issue");
        }

    
        $totalQuery = "SELECT total_marks FROM quizzes WHERE id = :qid";
        $total = $this->db->query($totalQuery)->first([":qid" => $quiz_id]);

        if (!$total) {
        return sendResponse(false, "Quiz not found");
        }

        $total_marks = (int)$total['total_marks'];

    
        $userQuery = "SELECT user_id FROM user_tokens 
                  WHERE token = :token AND is_active = true AND expires_at > NOW()";
        $user = $this->db->query($userQuery)->first([":token" => $token]);

        if (!$user) {
        return sendResponse(false, "User not found or token expired");
        }

        $user_id = $user['user_id'];

    
        $insertAttempt = "INSERT INTO attempts(
                        user_id, quiz_id, obtained_marks, total_marks, started_at, is_completed
                      )
                      VALUES(:user_id, :quiz_id, 0, :total_marks, :started_at, false)
                      RETURNING id";

        $attempt = $this->db->query($insertAttempt)->first([
        ":user_id"     => $user_id,
        ":quiz_id"     => $quiz_id,
        ":total_marks" => $total_marks,
        ":started_at"  => $startedAt
        ]);

        if (!$attempt) {
        return sendResponse(false, "Failed to create attempt");
        }

        $attemptId = $attempt['id'];

        foreach ($answers as $ans) {
        if (!isset($ans['question_id'], $ans['option_id'])) continue;

        $insertAnswer = "INSERT INTO answers(attempt_id, question_id, option_id)
                     VALUES(:aid, :qid, :oid)";
        $this->db->query($insertAnswer)->create([
        ":aid" => $attemptId,
        ":qid" => (int)$ans['question_id'],
        ":oid" => (int)$ans['option_id']
        ]);
        }


    
        $scoreQuery = "SELECT COALESCE(SUM(q.marks),0) AS score
                   FROM answers a
                   JOIN options o ON a.option_id = o.id
                   JOIN questions q ON a.question_id = q.id
                   WHERE a.attempt_id = :aid AND o.is_correct = true";

        $scoreStatus = $this->db->query($scoreQuery)->first([":aid" => $attemptId]);
        $score = (int)($scoreStatus['score'] ?? 0);

    
        $updateQuery = "UPDATE attempts
                    SET obtained_marks = :score, 
                        submitted_at = NOW(), 
                        is_completed = true
                    WHERE id = :aid";

        $updateStatus = $this->db->query($updateQuery)->update([
        ":score" => $score,
        ":aid"   => $attemptId
        ]);

        if ($updateStatus === false) {
        return sendResponse(false, "Failed to update attempt");
        }

    
        $countQuery = "SELECT COUNT(*) AS attempts_count
                   FROM attempts
                   WHERE user_id = :uid AND quiz_id = :qid";

        $countStatus = $this->db->query($countQuery)->first([
        ":uid" => $user_id,
        ":qid" => $quiz_id
        ]);

        $attemptsCount = (int)($countStatus['attempts_count'] ?? 1);

        $bestQuery = "SELECT MAX(obtained_marks) AS best_score
                  FROM attempts
                  WHERE user_id = :uid AND quiz_id = :qid";

        $bestRow = $this->db->query($bestQuery)->first([
        ":uid" => $user_id,
        ":qid" => $quiz_id
        ]);

        $bestScore = (int)($bestRow['best_score'] ?? $score);

        $data = [
        "quiz_id"        => $quiz_id,
        "obtained_marks" => $score,
        "total_marks"    => $total_marks,
        "attempts_count" => $attemptsCount,   
        "started_at"     => $startedAt,
        "submitted_at"   => date("Y-m-d H:i:s")
        ];

        return sendResponse(true, "Submitted successfully", $data);
    }

    function getLastAttempt($token) {
        $check = $this->userAuth($token);
        if (!$check) {
        return sendResponse(false, "Token issue");
        }

    
        $user = $this->db->query(
        "SELECT user_id FROM user_tokens WHERE token = :token AND is_active = true"
        )->first([":token" => $token]);

        if (!$user) {
        return sendResponse(false, "User not found");
        }

        $user_id = $user['user_id'];

        $query = "
        SELECT 
            a.quiz_id,
            q.title AS quiz_title,
            a.obtained_marks AS score,
            a.total_marks,
            q.duration_minutes
        FROM attempts a
        JOIN quizzes q ON a.quiz_id = q.id
        WHERE a.user_id = :uid AND a.is_completed = true
        ORDER BY a.submitted_at DESC
        LIMIT 1
        ";

        $result = $this->db->query($query)->first([":uid" => $user_id]);

        if (!$result) {
        return sendResponse(true, "No attempts found", null);
        }

        return sendResponse(true, "Last attempt fetched", $result);
    }


}

