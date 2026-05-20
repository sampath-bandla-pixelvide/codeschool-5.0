-- Active: 1700474726424@@127.0.0.1@5432@store@public
-- ************************************************************
-- EASY (10 Questions) - Simple SELECT, WHERE, ORDER BY, LIMIT
-- ************************************************************

-- Q1. Get all film titles and their release years.
SELECT title, release_year FROM film;

-- Q2. Get all customers' first name and last name sorted by last name alphabetically.
SELECT first_name , last_name FROM customer ORDER BY last_name ASC;

-- Q3. Get all films that have a rental_rate greater than 2.99.
SELECT title, rental_rate FROM film WHERE rental_rate >2.99;


-- Q4. Get the distinct ratings available in the film table.
SELECT DISTINCT rating FROM film;


-- Q5. Get the first 10 films sorted by title in ascending order.
SELECT title FROM film ORDER BY title ASC LIMIT 10 ;


-- Q6. Get all actors whose first name is 'John'.
SELECT first_name FROM actor WHERE first_name='John';


-- Q7. Get all films where the length is between 60 and 120 minutes.
SELECT title FROM film WHERE length BETWEEN 60 AND 120;


-- Q8. Get the total number of films in the film table.
SELECT COUNT(*) FROM film;

-- Q9. Get all customers who are active (active = 1).
SELECT * FROM customer WHERE active=1;

-- Q10. Get all film titles that contain the word 'love' (case-insensitive).
SELECT * FROM film WHERE title ILIKE '%love%';



-- ************************************************************
-- MEDIUM (10 Questions) - JOINs, GROUP BY, HAVING, Subqueries
-- ************************************************************

-- Q11. Get each film title along with its language name.
SELECT f.title, l.name FROM film AS f 
JOIN language AS l ON 
l.language_id = f.language_id;


-- Q12. Get the number of films in each rating category (e.g., PG, R, G).
SELECT rating, count(title) FROM film
GROUP BY rating; 


-- Q13. Get each customer's full name and the city they live in.
SELECT CONCAT(first_name, ' ', last_name) AS "full name", city FROM customer 
JOIN address ON address.address_id = customer.address_id
JOIN city ON city.city_id=address.city_id;


-- Q14. Get the total number of films each actor has appeared in, sorted by count descending.
--      Show actor first_name, last_name, and film_count.
SELECT actor.first_name, actor.last_name, COUNT(film.film_id) AS film_count FROM actor
JOIN film_actor ON film_actor.actor_id=actor.actor_id
JOIN film ON film.film_id =film_actor.film_id
GROUP BY actor.first_name, actor.last_name
ORDER BY film_count DESC;

-- Duplicates actors
SELECT first_name, last_name, COUNT(*)
FROM actor
GROUP BY first_name, last_name
HAVING COUNT(*) > 1;


-- Q15. Get all categories and the number of films in each category.
SELECT name, COUNT(film.film_id) AS "No.of films" FROM category
JOIN film_category ON film_category.category_id = category.category_id
JOIN film ON film.film_id =film_category.film_id
GROUP BY name;


-- Q16. Find categories that have more than 60 films.
SELECT name, COUNT(film.film_id) AS "No.of films" FROM category
JOIN film_category ON film_category.category_id = category.category_id
JOIN film ON film.film_id =film_category.film_id
GROUP BY name
HAVING COUNT(film.film_id) >60;


-- Q17. Get each store's id and the city where it is located.
SELECT store_id, city FROM store
JOIN address ON address.address_id =store.address_id
JOIN city ON city.city_id =address.city_id;


-- Q17. Get each store manager and the city where it is located.

SELECT CONCAT(first_name ,' ', last_name) AS "Manager Name", city FROM store
JOIN staff ON staff.staff_id=store.manager_staff_id
JOIN address ON address.address_id =staff.address_id
JOIN city ON city.city_id =address.city_id;



-- Q18. Get the total revenue (sum of amount) collected by each staff member.
--      Show staff first_name, last_name, and total_revenue.
SELECT first_name , last_name , SUM(amount) FROM staff
JOIN payment ON payment.staff_id=staff.staff_id
GROUP BY first_name, last_name;


-- Q19. Get all customers who have never made a rental.
SELECT * FROM CUSTOMER
JOIN rental ON rental.customer_id=customer.customer_id
WHERE rental.customer_id IS NULL;

-- Q20. Get the top 5 most rented films (by number of times rented).
--      Show film title and rental_count.
SELECT title,COUNT(rental.rental_id) AS "No.of Rented" FROM film 
JOIN inventory ON inventory.film_id = film.film_id
JOIN rental ON rental.inventory_id = inventory.inventory_id
GROUP BY title
ORDER BY COUNT(rental.rental_id) DESC LIMIT 5


-- ************************************************************
-- HARD (10 Questions) - Multi-JOINs, Subqueries, CTEs, Window Functions
-- ************************************************************

-- Q21. Get each customer's full name, email, and the total amount they have spent on rentals.
--      Sort by total amount descending. Show top 10 customers.

SELECT CONCAT(first_name , ' ',last_name) AS full_name , email, SUM(amount) AS total_amount FROM customer 
JOIN rental ON rental.customer_id =customer.customer_id 
JOIN payment ON payment.rental_id = rental.rental_id
GROUP BY full_name, email
ORDER BY total_amount DESC 
LIMIT 10

SELECT 
  CONCAT(c.first_name, ' ', c.last_name) AS full_name,
  c.email,
  SUM(p.amount) AS total_amount
FROM customer c
JOIN rental r 
  ON r.customer_id = c.customer_id
JOIN payment p 
  ON p.rental_id = r.rental_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.email
ORDER BY total_amount DESC
LIMIT 10;


-- Q22. For each film, show the title, category name, and the number of times it was rented.

SELECT f.title, c.name, COUNT(r.rental_id) AS no_of_times_rental FROM film AS f
JOIN film_category AS fc ON fc.film_id = f.film_id
JOIN category AS c ON c.category_id=fc.category_id
JOIN inventory AS i ON i.film_id=f.film_id
JOIN rental AS r ON r.inventory_id=i.inventory_id
GROUP BY f.title, c.name;

WITH film_rental AS (
    SELECT film.film_id , title,COUNT(rental.rental_id) AS rental_count FROM film 
JOIN inventory ON inventory.film_id = film.film_id
JOIN rental ON rental.inventory_id = inventory.inventory_id
GROUP BY film.film_id,film.title
),
film_category_cte AS (
    SELECT film.film_id, category.name AS category_name FROM film 
JOIN film_category 
ON film_category.film_id = film.film_id 
JOIN category  ON category.category_id = film_category.category_id)
SELECT fr.title, fc.category_name , fr.rental_count 
FROM film_rental fr 
JOIN film_category_cte fc
 ON fr.film_id = fc.film_id
ORDER BY fr.rental_count DESC;


SELECT 
    fr.title,
    fc.category_name,
    fr.rental_count
FROM (
    SELECT 
        f.film_id,
        f.title,
        COUNT(r.rental_id) AS rental_count
    FROM film f
    LEFT JOIN inventory i ON i.film_id = f.film_id
    LEFT JOIN rental r ON r.inventory_id = i.inventory_id
    GROUP BY f.film_id, f.title
) fr
JOIN (
    SELECT 
        f.film_id,
        c.name AS category_name
    FROM film f
    JOIN film_category fc ON fc.film_id = f.film_id
    JOIN category c ON c.category_id = fc.category_id
) fc
ON fr.film_id = fc.film_id
ORDER BY fr.rental_count DESC;



-- Q23. Get the average rental duration (in days) per film category.
--      Use (return_date - rental_date) to calculate duration.
SELECT c.name AS category_name,ROUND(
  AVG(EXTRACT(EPOCH FROM (r.return_date - r.rental_date)) / 86400),
  2
) AS avg_rental_duration
FROM category AS c
JOIN film_category AS fc  ON fc.category_id = c.category_id
JOIN film AS f  ON f.film_id = fc.film_id
JOIN inventory AS i  ON i.film_id = f.film_id
JOIN rental AS r ON r.inventory_id=i.inventory_id
WHERE r.return_date IS NOT NULL
GROUP BY c.name
ORDER BY avg_rental_duration DESC;

-- Q24. Find actors who have appeared in films across more than 10 different categories.
SELECT DISTINCT(a.first_name), COUNT(DISTINCT c.category_id) AS count FROM actor AS a
JOIN film_actor AS fa ON fa.actor_id = a.actor_id
JOIN film AS f ON f.film_id = fa.film_id
JOIN film_category AS fc ON fc.film_id = f.film_id
JOIN category AS c ON c.category_id = fc.category_id
GROUP BY a.first_name
HAVING COUNT(DISTINCT c.category_id) > 10


-- Q25. Get the monthly revenue for the year 2007 (one row per month).
--      Show month number and total_revenue.
SELECT EXTRACT(MONTH FROM payment_date) AS month, SUM(amount) AS total_revenue FROM payment 
WHERE EXTRACT(YEAR FROM payment_date)=2007
GROUP BY month 

-- Q26. Rank customers by their total payment amount within each store using a window function.
--      Show store_id, customer full name, total_amount, and rank.
SELECT s.store_id, CONCAT(c.first_name,' ',c.last_name) AS full_name, SUM(p.amount) AS total_amount 
FROM store AS s 
JOIN 

-- Q27. Find films that have never been rented.

SELECT f.film_id, f.title FROM film AS f
LEFT JOIN inventory AS i  ON i.film_id = f.film_id
LEFT JOIN rental AS r ON r.inventory_id=i.inventory_id
WHERE r.rental_id IS NULL
GROUP BY f.film_id, f.title;

-- Q28. For each country, get the total number of customers.
--      Show country name and customer_count, sorted by customer_count descending.
SELECT ct.country, COUNT(c.customer_id) AS customer_count 
FROM customer AS c
JOIN address AS a ON a.address_id = c.address_id
JOIN city ON city.city_id = a.city_id
JOIN country AS ct ON ct.country_id = city.country_id
GROUP BY ct.country
ORDER BY COUNT(c.customer_id) DESC


-- Q29. Find pairs of actors who have appeared together in more than 3 films.
--      Show actor1 name, actor2 name, and the number of shared films.

SELECT 
    CONCAT(a1.first_name, ' ', a1.last_name) AS actor1,
    CONCAT(a2.first_name, ' ', a2.last_name) AS actor2,
    COUNT(*) AS shared_films
FROM film_actor fa1
JOIN film_actor fa2 
    ON fa1.film_id = fa2.film_id
   AND fa1.actor_id < fa2.actor_id
JOIN actor a1 
    ON a1.actor_id = fa1.actor_id
JOIN actor a2 
    ON a2.actor_id = fa2.actor_id
GROUP BY 
    a1.actor_id, a1.first_name, a1.last_name,
    a2.actor_id, a2.first_name, a2.last_name
HAVING COUNT(*) > 3
ORDER BY shared_films DESC;

SELECT NOW();
 
SELECT a.actor_id FROM actor AS a
JOIN film_actor AS fa ON fa.actor_id = a.actor_id
JOIN film AS f ON f.film_id =fa.film_id
GROUP BY a.actor; 

-- Q30. Using a CTE, find the top 3 spending customers per store.
--      Show store_id, customer full name, and total_spent.