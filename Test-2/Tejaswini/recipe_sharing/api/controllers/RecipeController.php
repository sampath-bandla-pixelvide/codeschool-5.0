<?php

require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class RecipeController
{
    private $db;

    public function __construct()
    {
        $this->db = new DB();
    }


    public function getRecipes($search = "")
    {
        $recipes = $this->db
            ->query("
            SELECT
                r.id,
                r.title,
                r.description,

                (
                    SELECT image_path
                    FROM recipe_images ri
                    WHERE ri.recipe_id = r.id
                    AND ri.status = true
                    LIMIT 1
                ) AS image,

                EXISTS (
                    SELECT 1
                    FROM wishlist w
                    WHERE w.recipe_id = r.id
                    AND w.user_id = :user_id
                    AND w.status = true
                ) AS wishlisted

            FROM recipes r

            WHERE r.status = true
            AND r.title ILIKE :search

            ORDER BY r.id DESC
        ")
            ->get([
                ":search" => "%" . $search . "%",
                ":user_id" => $_SESSION["user"]["id"]
            ]);

        return sendResponse(
            true,
            "Recipes fetched successfully",
            $recipes
        );
    }
    public function getRecipe($id)
    {
        $recipe = $this->db
            ->query("
            SELECT
                id,
                title,
                description,
                ingredients,
                steps
            FROM recipes
            WHERE id = :id
            AND status = true
            LIMIT 1
        ")
            ->first([
                ":id" => $id
            ]);

        if (!$recipe) {
            return sendResponse(false, "Recipe not found");
        }

        $images = $this->db
            ->query("
            SELECT image_path
            FROM recipe_images
            WHERE recipe_id = :recipe_id
            AND status = true
            ORDER BY id ASC
        ")
            ->get([
                ":recipe_id" => $id
            ]);

        $recipe["images"] = $images;

        return sendResponse(
            true,
            "Recipe fetched successfully",
            $recipe
        );
    }
    public function addRecipe($title, $description, $ingredient, $steps, $images)
    {
        if ($_SESSION["user"]["role"] !== "admin") {
            return sendResponse(false, "Only admin can add recipes");
        }
        if (!$title) {
            return sendResponse(false, "Title is required");
        }
        if (!$ingredient) {
            return sendResponse(false, "Ingredient is required");
        }
        if (!isset($images["name"]) || empty($images["name"][0])) {
            return sendResponse(false, "At least one image is required");
        }

        $recipeId = $this->db
            ->query("
            INSERT INTO recipes (
                user_id,
                title,
                description,
                ingredients,
                steps
            )
            VALUES (
                :user_id,
                :title,
                :description,
                :ingredients,
                :steps
            )
            RETURNING id
        ")
            ->first([
                ":user_id" => $_SESSION["user"]["id"],
                ":title" => $title,
                ":description" => $description,
                ":ingredients" => $ingredient,
                ":steps" => $steps
            ])["id"];

        $uploadPath = __DIR__ . "/../../uploads/recipes/";

        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }

        foreach ($images["name"] as $i => $imageName) {
            $tmpName = $images["tmp_name"][$i];
            $newName = time() . "_" . $imageName;
            move_uploaded_file(
                $tmpName,
                $uploadPath . $newName
            );
            $this->db
                ->query("
                INSERT INTO recipe_images (
                    recipe_id,
                    image_path,
                    source_type
                )
                VALUES (
                    :recipe_id,
                    :image_path,
                    'upload'
                )
            ")
                ->execute([
                    ":recipe_id" => $recipeId,
                    ":image_path" => "uploads/recipes/" . $newName
                ]);
        }

        return sendResponse(true, "Recipe added successfully");
    }
    // public function toggleWishlist($recipeId)
    // {
    //     if (!$recipeId) {
    //         return sendResponse(false, "Recipe id is required");
    //     }
    //     $wishlist = $this->db
    //         ->query("
    //         SELECT id, status
    //         FROM wishlist
    //         WHERE user_id = :user_id
    //         AND recipe_id = :recipe_id
    //         LIMIT 1
    //     ")
    //         ->first([
    //             ":user_id" => $_SESSION["user"]["id"],
    //             ":recipe_id" => $recipeId
    //         ]);

    //     if ($wishlist) {
    //         // $newStatus = !$wishlist["status"];
    //         $currentStatus = filter_var($wishlist["status"], FILTER_VALIDATE_BOOLEAN);
    //         $newStatus = !$currentStatus;
    //         $this->db
    //             ->query("
    //             UPDATE wishlist
    //             SET status = :status
    //             WHERE id = :id
    //         ")
    //             ->execute([
    //                 ":status" => $newStatus,
    //                 ":id" => $wishlist["id"]
    //             ]);

    //         return sendResponse(
    //             true,
    //             "Wishlist updated",
    //             ["wishlisted" => $newStatus]
    //         );
    //     }

    //     $this->db
    //         ->query("
    //         INSERT INTO wishlist (
    //             user_id,
    //             recipe_id
    //         )
    //         VALUES (
    //             :user_id,
    //             :recipe_id
    //         )
    //     ")
    //         ->execute([
    //             ":user_id" => $_SESSION["user"]["id"],
    //             ":recipe_id" => $recipeId
    //         ]);

    //     return sendResponse(
    //         true,
    //         "Added to wishlist",
    //         [
    //             "wishlisted" => true
    //         ]
    //     );
    // }
    public function toggleWishlist($recipeId)
    {
        if (!$recipeId) {
            return sendResponse(false, "Recipe id is required");
        }

        $wishlist = $this->db
            ->query("
            SELECT id, status
            FROM wishlist
            WHERE user_id = :user_id
            AND recipe_id = :recipe_id
            LIMIT 1
        ")
            ->first([
                ":user_id" => $_SESSION["user"]["id"],
                ":recipe_id" => $recipeId
            ]);

        if ($wishlist) {


            $currentStatus =
                $wishlist["status"] === true ||
                $wishlist["status"] === 't' ||
                $wishlist["status"] == 1;

            $newStatus = !$currentStatus;

            $this->db
                ->query("
                UPDATE wishlist
                SET status = :status
                WHERE id = :id
            ")
                ->execute([
                    ":status" => $newStatus ? 'true' : 'false',
                    ":id" => $wishlist["id"]
                ]);

            return sendResponse(
                true,
                "Wishlist updated",
                ["wishlisted" => $newStatus]
            );
        }

        // Insert new wishlist (default TRUE)
        $this->db
            ->query("
            INSERT INTO wishlist (
                user_id,
                recipe_id,
                status
            )
            VALUES (
                :user_id,
                :recipe_id,
                :status
            )
        ")
            ->execute([
                ":user_id" => $_SESSION["user"]["id"],
                ":recipe_id" => $recipeId,
                ":status" => true
            ]);

        return sendResponse(
            true,
            "Added to wishlist",
            [
                "wishlisted" => true
            ]
        );
    }
    public function getWishlist($userId)
    {
        $recipes = $this->db
            ->query("
            SELECT
                r.id,r.title,r.description,
                (
                    SELECT image_path
                    FROM recipe_images ri
                    WHERE ri.recipe_id = r.id
                    AND ri.status = true
                    LIMIT 1
                ) AS image
            FROM wishlist w
            JOIN recipes r
            ON r.id = w.recipe_id
            WHERE w.user_id = :user_id AND w.status = true AND r.status = true
            ORDER BY w.id DESC
        ")
            ->get([
                ":user_id" => $userId
            ]);
        return sendResponse(true, "Wishlist fetched successfully", $recipes);
    }
    public function getProfile()
    {
        $user = $_SESSION['user'];

        if ($user["role"] === "admin") {

            $count = $this->db
                ->query("
                SELECT COUNT(*) AS total
                FROM recipes
                WHERE user_id = :user_id
                AND status = true
            ")
                ->first([
                    ":user_id" => $user['id']
                ])["total"];

            $user["label"] = "Uploaded Recipes";
        } else {

            $count = $this->db
                ->query("
                SELECT COUNT(*) AS total
                FROM wishlist
                WHERE user_id = :user_id
                AND status = true
            ")
                ->first([
                    ":user_id" => $user['id']
                ])["total"];

            $user["label"] = "Wishlist Recipes";
        }

        $user["total"] = $count;

        return sendResponse(
            true,
            "Profile fetched successfully",
            $user
        );
    }
    public function changePassword(
        $userId,
        $currentPassword,
        $newPassword,
        $confirmPassword
    ) {
        if (
            !$currentPassword ||
            !$newPassword ||
            !$confirmPassword
        ) {
            return sendResponse(false, "All fields are required");
        }

        if ($newPassword !== $confirmPassword) {
            return sendResponse(false, "Passwords do not match");
        }

        $user = $this->db
            ->query("
            SELECT password
            FROM users
            WHERE id = :id
            LIMIT 1
        ")
            ->first([
                ":id" => $userId
            ]);

        if (
            !$user ||
            !password_verify(
                $currentPassword,
                $user["password"]
            )
        ) {
            return sendResponse(false, "Current password is incorrect");
        }

        $hashedPassword =
            password_hash($newPassword, PASSWORD_DEFAULT);

        $this->db
            ->query("
            UPDATE users
            SET password = :password
            WHERE id = :id
        ")
            ->execute([
                ":password" => $hashedPassword,
                ":id" => $userId
            ]);

        return sendResponse(
            true,
            "Password changed successfully"
        );
    }
}
