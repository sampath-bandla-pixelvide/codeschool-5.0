<?php
require_once(__DIR__ . "/../utils/db.php");
require_once(__DIR__ . "/../utils/functions.php");

class CourseController {
    private $db;

    public function __construct() {
        $this->db = new DB();
    }


    public function getCourses($user) {
        $search = $_GET['search'] ?? '';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;

        $query = "SELECT c.*, u.name as admin_name FROM courses c JOIN users u ON c.admin_id = u.user_id";
        $params = [];

        if (!empty($search)) {
            $query .= " WHERE c.title ILIKE :search";
            $params[':search'] = "%$search%";
        }

        $query .= " ORDER BY c.created_at DESC LIMIT $limit OFFSET $offset";

        $this->db->query($query);
        $courses = $this->db->get($params);

        foreach($courses as &$c) {
            $this->db->query("SELECT AVG(rating) as avg_rating FROM ratings WHERE course_id = :course_id");
            $r = $this->db->first([':course_id' => $c['course_id']]);
            $c['avg_rating'] = $r['avg_rating'] ? round($r['avg_rating'], 1) : 0;
        }

        sendResponse(true, "Courses retrieved", $courses);
    }


    public function getAdminCourses($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized: Only admin can view admin courses");
        }

        $this->db->query("SELECT * FROM courses WHERE admin_id = :admin_id ORDER BY created_at DESC");
        $courses = $this->db->get([':admin_id' => $user['user_id']]);

        foreach ($courses as &$course) {
            $this->db->query("SELECT count(*) as lesson_count FROM lessons WHERE course_id = :course_id");
            $lc = $this->db->first([':course_id' => $course['course_id']]);
            $course['lesson_count'] = $lc['lesson_count'];

            $this->db->query("SELECT count(*) as student_count FROM enrollments WHERE course_id = :course_id AND status = 'approved'");
            $sc = $this->db->first([':course_id' => $course['course_id']]);
            $course['student_count'] = $sc['student_count'];
        }

        sendResponse(true, "Courses retrieved successfully", $courses);
    }


    public function createCourse($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized: Only admin can create courses");
        }

        $title = $_POST["title"] ?? '';
        $description = $_POST["description"] ?? '';
        $price = isset($_POST["price"]) ? floatval($_POST["price"]) : 0;
        $auto_enroll = isset($_POST['auto_enroll']) ? ($_POST['auto_enroll'] === '1' || $_POST['auto_enroll'] === 'true') : true;

        if (empty($title)) {
            sendResponse(false, "Title is required");
        }

        $this->db->query("INSERT INTO courses (title, description, price, admin_id) VALUES (:title, :description, :price, :admin_id) RETURNING course_id");
        $result = $this->db->first(['title' => $title, 'description' => $description, 'price' => $price, 'admin_id' => $user['user_id']]);

        if ($result && isset($result['course_id'])) {
            $course_id = $result['course_id'];
            $this->db->query("INSERT INTO enrollment_settings (admin_id, course_id, auto_enroll) VALUES (:aid, :cid, :auto)");
            $this->db->create([':aid' => $user['user_id'], ':cid' => $course_id, ':auto' => $auto_enroll ? 'true' : 'false']);
            sendResponse(true, "Course created successfully");
        } else {
            sendResponse(false, "Failed to create course");
        }
    }

    public function editCourse($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized: Only admin can edit courses");
        }

        $course_id = $_POST["course_id"] ?? '';
        $title = $_POST["title"] ?? '';
        $description = $_POST["description"] ?? '';
        $price = isset($_POST["price"]) ? floatval($_POST["price"]) : 0;
        $auto_enroll = isset($_POST['auto_enroll']) ? ($_POST['auto_enroll'] === '1' || $_POST['auto_enroll'] === 'true') : null;

        if (empty($course_id) || empty($title)) {
            sendResponse(false, "Course ID and Title are required");
        }

        $this->db->query("UPDATE courses SET title = :title, description = :description, price = :price WHERE course_id = :course_id AND admin_id = :admin_id");
        $updated = $this->db->update([':title' => $title, ':description' => $description, ':price' => $price, ':course_id' => $course_id, ':admin_id' => $user['user_id']]);

        if ($auto_enroll !== null) {
            $this->db->query("SELECT setting_id FROM enrollment_settings WHERE admin_id = :aid AND course_id = :cid");
            $existing = $this->db->first([':aid' => $user['user_id'], ':cid' => $course_id]);

            if ($existing) {
                $this->db->query("UPDATE enrollment_settings SET auto_enroll = :auto, updated_at = CURRENT_TIMESTAMP WHERE admin_id = :aid AND course_id = :cid");
                $this->db->update([':auto' => $auto_enroll ? 'true' : 'false', ':aid' => $user['user_id'], ':cid' => $course_id]);
            } else {
                $this->db->query("INSERT INTO enrollment_settings (admin_id, course_id, auto_enroll) VALUES (:aid, :cid, :auto)");
                $this->db->create([':aid' => $user['user_id'], ':cid' => $course_id, ':auto' => $auto_enroll ? 'true' : 'false']);
            }
        }

        if ($updated) {
            sendResponse(true, "Course updated successfully");
        } else {
            sendResponse(false, "Failed to update course");
        }
    }


    public function deleteCourse($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized: Only admin can delete courses");
        }

        $course_id = $_POST["course_id"] ?? '';
        if (empty($course_id)) {
            sendResponse(false, "Course ID is required");
        }

        $this->db->query("SELECT count(*) as enrolled_count FROM enrollments WHERE course_id = :cid AND status = 'approved'");
        $enrollCount = $this->db->first([':cid' => $course_id]);

        if ($enrollCount && (int)$enrollCount['enrolled_count'] > 0) {
            sendResponse(false, "Cannot delete this course — " . $enrollCount['enrolled_count'] . " student(s) are currently enrolled. Remove all enrollments first.");
        }

        $this->db->query("DELETE FROM courses WHERE course_id = :course_id AND admin_id = :admin_id");
        if ($this->db->delete([':course_id' => $course_id, ':admin_id' => $user['user_id']])) {
            sendResponse(true, "Course deleted successfully");
        } else {
            sendResponse(false, "Failed to delete course");
        }
    }


    public function addLesson($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized: Only admin can add lessons");
        }

        $course_id = $_POST["course_id"] ?? '';
        $title = $_POST["title"] ?? '';
        $content = $_POST["content"] ?? '';
        $lesson_order = $_POST["lesson_order"] ?? 1;

        if (empty($course_id) || empty($title)) {
            sendResponse(false, "Course ID and Lesson Title are required");
        }

        $this->db->query("INSERT INTO lessons (course_id, title, content, lesson_order) VALUES (:course_id, :title, :content, :lesson_order)");
        if ($this->db->create(['course_id' => $course_id, 'title' => $title, 'content' => $content, 'lesson_order' => $lesson_order])) {
            sendResponse(true, "Lesson added successfully");
        } else {
            sendResponse(false, "Failed to add lesson");
        }
    }


    public function editLesson($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized: Only admin can edit lessons");
        }

        $lesson_id = $_POST["lesson_id"] ?? '';
        $title = $_POST["title"] ?? '';
        $content = $_POST["content"] ?? '';
        $lesson_order = $_POST["lesson_order"] ?? 1;

        if (empty($lesson_id) || empty($title)) {
            sendResponse(false, "Lesson ID and Title are required");
        }


        $this->db->query("SELECT c.admin_id FROM lessons l JOIN courses c ON l.course_id = c.course_id WHERE l.lesson_id = :lesson_id");
        $lesson = $this->db->first([':lesson_id' => $lesson_id]);

        if (!$lesson || $lesson['admin_id'] !== $user['user_id']) {
            sendResponse(false, "Unauthorized or lesson not found");
        }

        $this->db->query("UPDATE lessons SET title = :title, content = :content, lesson_order = :lesson_order WHERE lesson_id = :lesson_id");
        if ($this->db->update([':title' => $title, ':content' => $content, ':lesson_order' => $lesson_order, ':lesson_id' => $lesson_id])) {
            sendResponse(true, "Lesson updated successfully");
        } else {
            sendResponse(false, "Failed to update lesson");
        }
    }


    public function deleteLesson($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized: Only admin can delete lessons");
        }

        $lesson_id = $_POST["lesson_id"] ?? '';

        if (empty($lesson_id)) {
            sendResponse(false, "Lesson ID is required");
        }


        $this->db->query("SELECT c.admin_id FROM lessons l JOIN courses c ON l.course_id = c.course_id WHERE l.lesson_id = :lesson_id");
        $lesson = $this->db->first([':lesson_id' => $lesson_id]);

        if (!$lesson || $lesson['admin_id'] !== $user['user_id']) {
            sendResponse(false, "Unauthorized or lesson not found");
        }

        $this->db->query("DELETE FROM lessons WHERE lesson_id = :lesson_id");
        if ($this->db->delete([':lesson_id' => $lesson_id])) {
            sendResponse(true, "Lesson deleted successfully");
        } else {
            sendResponse(false, "Failed to delete lesson");
        }
    }


    public function getCourseRevenue($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized: Only admin can view revenue");
        }

        $this->db->query("
            SELECT COALESCE(SUM(c.price), 0) as total_revenue
            FROM enrollments e
            JOIN courses c ON e.course_id = c.course_id
            WHERE c.admin_id = :admin_id
        ");
        $res = $this->db->first([':admin_id' => $user['user_id']]);
        sendResponse(true, "Revenue retrieved", ['total_revenue' => $res['total_revenue']]);
    }


    public function getMyCourses($user) {
        if ($user['role'] !== 'student') {
            sendResponse(false, "Unauthorized: Only student has enrolled courses");
        }

        $this->db->query("
            SELECT c.*, e.enrolled_at
            FROM courses c
            JOIN enrollments e ON c.course_id = e.course_id
            WHERE e.user_id = :user_id AND e.status = 'approved'
            ORDER BY e.enrolled_at DESC
        ");
        $courses = $this->db->get([':user_id' => $user['user_id']]);

        foreach($courses as &$c) {
            $this->db->query("SELECT count(*) as total_lessons FROM lessons WHERE course_id = :course_id");
            $lc = $this->db->first([':course_id' => $c['course_id']]);
            $c['total_lessons'] = $lc['total_lessons'];

            $this->db->query("SELECT count(*) as completed_lessons FROM lesson_progress WHERE user_id = :user_id AND course_id = :course_id AND completed = TRUE");
            $cl = $this->db->first([':user_id' => $user['user_id'], ':course_id' => $c['course_id']]);
            $c['completed_lessons'] = $cl['completed_lessons'];

            $c['progress'] = $c['total_lessons'] > 0 ? round(($c['completed_lessons'] / $c['total_lessons']) * 100) : 0;
        }

        sendResponse(true, "My courses retrieved", $courses);
    }


    public function enroll($user) {
        if ($user['role'] !== 'student') {
            sendResponse(false, "Only students can enroll");
        }

        $course_id = $_POST['course_id'] ?? '';
        if (empty($course_id)) sendResponse(false, "Course ID required");

        $this->db->query("SELECT * FROM enrollments WHERE user_id = :uid AND course_id = :cid");
        $existing = $this->db->first([':uid' => $user['user_id'], ':cid' => $course_id]);
        if ($existing) {
            if ($existing['status'] === 'pending') {
                sendResponse(false, "Your enrollment is pending approval");
            } else if ($existing['status'] === 'rejected') {
                sendResponse(false, "Your enrollment was rejected");
            }
            sendResponse(false, "Already enrolled");
        }

        $this->db->query("SELECT admin_id FROM courses WHERE course_id = :cid");
        $course = $this->db->first([':cid' => $course_id]);
        if (!$course) sendResponse(false, "Course not found");

        $admin_id = $course['admin_id'];
        $auto_enroll = true;

        $this->db->query("SELECT auto_enroll FROM enrollment_settings WHERE admin_id = :aid AND course_id IS NULL");
        $globalSetting = $this->db->first([':aid' => $admin_id]);
        $global_auto = true;
        if ($globalSetting) {
            $global_auto = $globalSetting['auto_enroll'] === true || $globalSetting['auto_enroll'] === 't' || $globalSetting['auto_enroll'] === 1;
        }

        if (!$global_auto) {
            $auto_enroll = false;
        } else {
            $this->db->query("SELECT auto_enroll FROM enrollment_settings WHERE admin_id = :aid AND course_id = :cid");
            $courseSetting = $this->db->first([':aid' => $admin_id, ':cid' => $course_id]);

            if ($courseSetting) {
                $auto_enroll = $courseSetting['auto_enroll'] === true || $courseSetting['auto_enroll'] === 't' || $courseSetting['auto_enroll'] === 1;
            }
        }

        $status = $auto_enroll ? 'approved' : 'pending';

        $this->db->query("INSERT INTO enrollments (user_id, course_id, status) VALUES (:uid, :cid, :status)");
        if ($this->db->create([':uid' => $user['user_id'], ':cid' => $course_id, ':status' => $status])) {
            if ($status === 'pending') {
                sendResponse(true, "Enrollment request submitted. Waiting for admin approval.");
            }
            sendResponse(true, "Enrolled successfully");
        } else {
            sendResponse(false, "Failed to enroll");
        }
    }

    public function getCourseProgress($user) {
        if ($user['role'] !== 'student') {
            sendResponse(false, "Only students can track progress");
        }

        $course_id = $_GET['course_id'] ?? '';
        if(empty($course_id)) sendResponse(false, "Course ID required");

        $this->db->query("SELECT count(*) as total FROM lessons WHERE course_id = :cid");
        $t = $this->db->first([':cid' => $course_id]);
        $total = $t['total'];

        $this->db->query("SELECT count(*) as comp FROM lesson_progress WHERE user_id = :uid AND course_id = :cid AND completed = TRUE");
        $c = $this->db->first([':uid' => $user['user_id'], ':cid' => $course_id]);
        $comp = $c['comp'];

        $prog = $total > 0 ? round(($comp / $total) * 100) : 0;
        sendResponse(true, "Progress", ['progress' => $prog, 'completed' => $comp, 'total' => $total]);
    }


    public function getCourseLessons($user) {
        $course_id = $_GET['course_id'] ?? '';
        if(empty($course_id)) sendResponse(false, "Course ID required");

        $this->db->query("
            SELECT l.*, COALESCE(lp.completed, FALSE) as is_completed
            FROM lessons l
            LEFT JOIN lesson_progress lp ON l.lesson_id = lp.lesson_id AND lp.user_id = :uid
            WHERE l.course_id = :cid
            ORDER BY l.lesson_order ASC
        ");
        $lessons = $this->db->get([':uid' => $user['user_id'], ':cid' => $course_id]);

        sendResponse(true, "Lessons retrieved", $lessons);
    }


    public function markComplete($user) {
        if ($user['role'] !== 'student') {
            sendResponse(false, "Only students can mark lessons complete");
        }

        $lesson_id = $_POST['lesson_id'] ?? '';
        if (empty($lesson_id)) sendResponse(false, "Lesson ID required");

        $this->db->query("SELECT course_id FROM lessons WHERE lesson_id = :lid");
        $l = $this->db->first([':lid' => $lesson_id]);
        if(!$l) sendResponse(false, "Lesson not found");

        $course_id = $l['course_id'];

        $this->db->query("SELECT * FROM lesson_progress WHERE user_id = :uid AND lesson_id = :lid");
        if ($this->db->first([':uid' => $user['user_id'], ':lid' => $lesson_id])) {
            sendResponse(true, "Already marked");
        }

        $this->db->query("INSERT INTO lesson_progress (user_id, course_id, lesson_id, completed) VALUES (:uid, :cid, :lid, TRUE)");
        if ($this->db->create([':uid' => $user['user_id'], ':cid' => $course_id, ':lid' => $lesson_id])) {
            sendResponse(true, "Lesson marked complete");
        } else {
            sendResponse(false, "Failed");
        }
    }


    public function markUndone($user) {
        if ($user['role'] !== 'student') {
            sendResponse(false, "Only students can undo lessons");
        }

        $lesson_id = $_POST['lesson_id'] ?? '';
        if (empty($lesson_id)) sendResponse(false, "Lesson ID required");

        $this->db->query("DELETE FROM lesson_progress WHERE user_id = :uid AND lesson_id = :lid");
        if ($this->db->delete([':uid' => $user['user_id'], ':lid' => $lesson_id])) {
            sendResponse(true, "Lesson marked as undone");
        } else {
            sendResponse(false, "Failed");
        }
    }


    public function rateCourse($user) {
        if ($user['role'] !== 'student') {
            sendResponse(false, "Only students can rate");
        }

        $course_id = $_POST['course_id'] ?? '';
        $rating = (int)($_POST['rating'] ?? 0);
        $review = $_POST['review'] ?? '';

        if(empty($course_id) || $rating < 1 || $rating > 5) {
            sendResponse(false, "Invalid input");
        }

        $this->db->query("SELECT * FROM ratings WHERE user_id = :uid AND course_id = :cid");
        if($this->db->first([':uid' => $user['user_id'], ':cid' => $course_id])) {
            sendResponse(false, "You already rated this course");
        }

        $this->db->query("INSERT INTO ratings (user_id, course_id, rating, review) VALUES (:uid, :cid, :rating, :review)");
        if ($this->db->create([':uid' => $user['user_id'], ':cid' => $course_id, ':rating' => $rating, ':review' => $review])) {
            sendResponse(true, "Rated successfully");
        } else {
            sendResponse(false, "Failed");
        }
    }


    public function getCourseRatings($user) {
        $course_id = $_GET["course_id"] ?? '';

        if (empty($course_id)) {
            sendResponse(false, "Course ID is required");
        }

        $this->db->query("SELECT r.*, u.name as student_name FROM ratings r JOIN users u ON r.user_id = u.user_id WHERE r.course_id = :course_id ORDER BY r.created_at DESC");
        $ratings = $this->db->get([':course_id' => $course_id]);

        sendResponse(true, "Ratings retrieved", $ratings);
    }


    public function getAllStudents($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized: Only admin can view students");
        }

        $this->db->query("
            SELECT u.user_id, u.name, u.email, u.created_at,
                   COUNT(DISTINCT e.course_id) as enrolled_courses
            FROM users u
            LEFT JOIN enrollments e ON u.user_id = e.user_id AND e.status = 'approved'
            WHERE u.role = 'student'
            GROUP BY u.user_id, u.name, u.email, u.created_at
            ORDER BY u.created_at DESC
        ");
        $students = $this->db->get();

        sendResponse(true, "Students retrieved", $students);
    }


    public function getEnrollmentSettings($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized");
        }

        $this->db->query("SELECT auto_enroll FROM enrollment_settings WHERE admin_id = :aid AND course_id IS NULL");
        $global = $this->db->first([':aid' => $user['user_id']]);
        $globalAutoEnroll = $global ? ($global['auto_enroll'] === true || $global['auto_enroll'] === 't' || $global['auto_enroll'] === 1) : true;

        $this->db->query("
            SELECT c.course_id, c.title, es.auto_enroll
            FROM courses c
            LEFT JOIN enrollment_settings es ON c.course_id = es.course_id AND es.admin_id = :aid
            WHERE c.admin_id = :aid2
            ORDER BY c.title ASC
        ");
        $courses = $this->db->get([':aid' => $user['user_id'], ':aid2' => $user['user_id']]);

        foreach ($courses as &$c) {
            if ($c['auto_enroll'] === null) {
                $c['auto_enroll'] = $globalAutoEnroll;
                $c['uses_global'] = true;
            } else {
                $c['auto_enroll'] = $c['auto_enroll'] === true || $c['auto_enroll'] === 't' || $c['auto_enroll'] === 1;
                $c['uses_global'] = false;
            }
        }

        sendResponse(true, "Settings retrieved", [
            'global_auto_enroll' => $globalAutoEnroll,
            'courses' => $courses
        ]);
    }


    public function updateGlobalAutoEnroll($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized");
        }

        $auto_enroll = isset($_POST['auto_enroll']) ? ($_POST['auto_enroll'] === '1' || $_POST['auto_enroll'] === 'true') : true;

        $this->db->query("SELECT setting_id FROM enrollment_settings WHERE admin_id = :aid AND course_id IS NULL");
        $existing = $this->db->first([':aid' => $user['user_id']]);

        if ($existing) {
            $this->db->query("UPDATE enrollment_settings SET auto_enroll = :auto, updated_at = CURRENT_TIMESTAMP WHERE admin_id = :aid AND course_id IS NULL");
            $this->db->update([':auto' => $auto_enroll ? 'true' : 'false', ':aid' => $user['user_id']]);
        } else {
            $this->db->query("INSERT INTO enrollment_settings (admin_id, course_id, auto_enroll) VALUES (:aid, NULL, :auto)");
            $this->db->create([':aid' => $user['user_id'], ':auto' => $auto_enroll ? 'true' : 'false']);
        }

        sendResponse(true, "Global auto-enroll updated", ['auto_enroll' => $auto_enroll]);
    }


    public function updateCourseAutoEnroll($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized");
        }

        $course_id = $_POST['course_id'] ?? '';
        $auto_enroll = isset($_POST['auto_enroll']) ? ($_POST['auto_enroll'] === '1' || $_POST['auto_enroll'] === 'true') : true;
        $use_global = isset($_POST['use_global']) ? ($_POST['use_global'] === '1' || $_POST['use_global'] === 'true') : false;

        if (empty($course_id)) sendResponse(false, "Course ID required");

        $this->db->query("SELECT course_id FROM courses WHERE course_id = :cid AND admin_id = :aid");
        if (!$this->db->first([':cid' => $course_id, ':aid' => $user['user_id']])) {
            sendResponse(false, "Course not found or not yours");
        }

        if ($use_global) {
            $this->db->query("DELETE FROM enrollment_settings WHERE admin_id = :aid AND course_id = :cid");
            $this->db->delete([':aid' => $user['user_id'], ':cid' => $course_id]);
            sendResponse(true, "Course now uses global setting");
        }

        $this->db->query("SELECT setting_id FROM enrollment_settings WHERE admin_id = :aid AND course_id = :cid");
        $existing = $this->db->first([':aid' => $user['user_id'], ':cid' => $course_id]);

        if ($existing) {
            $this->db->query("UPDATE enrollment_settings SET auto_enroll = :auto, updated_at = CURRENT_TIMESTAMP WHERE admin_id = :aid AND course_id = :cid");
            $this->db->update([':auto' => $auto_enroll ? 'true' : 'false', ':aid' => $user['user_id'], ':cid' => $course_id]);
        } else {
            $this->db->query("INSERT INTO enrollment_settings (admin_id, course_id, auto_enroll) VALUES (:aid, :cid, :auto)");
            $this->db->create([':aid' => $user['user_id'], ':cid' => $course_id, ':auto' => $auto_enroll ? 'true' : 'false']);
        }

        sendResponse(true, "Course auto-enroll updated", ['auto_enroll' => $auto_enroll]);
    }


    public function getPendingEnrollments($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized");
        }

        $this->db->query("
            SELECT e.enrollment_id, e.user_id, e.course_id, e.enrolled_at, e.status,
                   u.name as student_name, u.email as student_email,
                   c.title as course_title
            FROM enrollments e
            JOIN users u ON e.user_id = u.user_id
            JOIN courses c ON e.course_id = c.course_id
            WHERE c.admin_id = :aid AND e.status = 'pending'
            ORDER BY e.enrolled_at ASC
        ");
        $pending = $this->db->get([':aid' => $user['user_id']]);

        sendResponse(true, "Pending enrollments retrieved", $pending);
    }


    public function approveEnrollment($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized");
        }

        $enrollment_id = $_POST['enrollment_id'] ?? '';
        if (empty($enrollment_id)) sendResponse(false, "Enrollment ID required");

        $this->db->query("
            SELECT e.* FROM enrollments e
            JOIN courses c ON e.course_id = c.course_id
            WHERE e.enrollment_id = :eid AND c.admin_id = :aid
        ");
        $enrollment = $this->db->first([':eid' => $enrollment_id, ':aid' => $user['user_id']]);
        if (!$enrollment) sendResponse(false, "Enrollment not found");

        $this->db->query("UPDATE enrollments SET status = 'approved' WHERE enrollment_id = :eid");
        if ($this->db->update([':eid' => $enrollment_id])) {
            sendResponse(true, "Enrollment approved");
        } else {
            sendResponse(false, "Failed to approve");
        }
    }


    public function rejectEnrollment($user) {
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized");
        }

        $enrollment_id = $_POST['enrollment_id'] ?? '';
        if (empty($enrollment_id)) sendResponse(false, "Enrollment ID required");

        $this->db->query("
            SELECT e.* FROM enrollments e
            JOIN courses c ON e.course_id = c.course_id
            WHERE e.enrollment_id = :eid AND c.admin_id = :aid
        ");
        $enrollment = $this->db->first([':eid' => $enrollment_id, ':aid' => $user['user_id']]);
        if (!$enrollment) sendResponse(false, "Enrollment not found");

        $this->db->query("DELETE FROM enrollments WHERE enrollment_id = :eid");
        if ($this->db->delete([':eid' => $enrollment_id])) {
            sendResponse(true, "Enrollment rejected");
        } else {
            sendResponse(false, "Failed to reject");
        }
    }
}
