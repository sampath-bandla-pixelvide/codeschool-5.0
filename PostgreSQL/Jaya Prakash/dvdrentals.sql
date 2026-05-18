-- Active: 1775629728003@@127.0.0.1@5432@store@public

-- ************************************************************
-- EASY (10 Questions) - Simple SELECT, WHERE, ORDER BY, LIMIT
-- ************************************************************

-- Q1. Get all film titles and their release years.
SELECT title, release_year from film;

-- Q2. Get all customers' first name and last name sorted by last name alphabetically.
SELECT first_name, last_name FROM customer ORDER BY last_name;

-- Q3. Get all films that have a rental_rate greater than 2.99.
SELECT title FROM film where rental_rate > 2.99;

-- Q4. Get the distinct ratings available in the film table.
SELECT DISTINCT rating FROM film;

-- Q5. Get the first 10 films sorted by title in ascending order.
SELECT * FROM film ORDER BY title LIMIT 10;

-- Q6. Get all actors whose first name is 'John'.
SELECT * FROM actor WHERE first_name = 'John';

-- Q7. Get all films where the length is between 60 and 120 minutes.
SELECT title FROM film WHERE "length" BETWEEN 60 AND 120;

-- Q8. Get the total number of films in the film table.
SELECT count(*) as Total_films FROM film;

-- Q9. Get all customers who are active (active = 1).
SELECT * FROM customer WHERE active = 1;

-- Q10. Get all film titles that contain the word 'love' (case-insensitive).
SELECT title FROM film WHERE title ILIKE '%love%';

-- ************************************************************
-- MEDIUM (10 Questions) - JOINs, GROUP BY, HAVING, Subqueries
-- ************************************************************

-- Q11. Get each film title along with its language name.
SELECT title, name
FROM film f
    INNER JOIN language l ON f.language_id = l.language_id;

-- Q12. Get the number of films in each rating category (e.g., PG, R, G).
SELECT rating, count(*) FROM film GROUP BY rating;

-- Q13. Get each customer's full name and the city they live in.
SELECT concat(first_name, ' ', last_name) as full_name, city
from
    customer c
    INNER JOIN address a ON c.address_id = a.address_id
    INNER JOIN city ON a.city_id = city.city_id;

-- Q14. Get the total number of films each actor has appeared in, sorted by count descending.
--      Show actor first_name, last_name, and film_count.
SELECT
    first_name,
    last_name,
    count(film.title) as film_count
FROM actor
    JOIN film_actor ON actor.actor_id = film_actor.actor_id
    JOIN film ON film_actor.film_id = film.film_id
GROUP BY
    first_name,
    last_name
ORDER BY count(film.title) DESC;

-- Q15. Get all categories and the number of films in each category.
SELECT name, count(f.title)
FROM
    category c
    JOIN film_category fc ON c.category_id = fc.category_id
    JOIN film f ON fc.film_id = f.film_id
GROUP BY
    c.name;

-- Q16. Find categories that have more than 60 films.
SELECT name, count(f.title) AS film_count
FROM
    category c
    JOIN film_category fc ON c.category_id = fc.category_id
    JOIN film f ON fc.film_id = f.film_id
GROUP BY
    c.name
HAVING
    count(f.title) > 60;

-- Q17. Get each store's id and the city where it is located.
-- manager name and city
SELECT concat(first_name, ' ', last_name) as Manager_name, c.city
FROM
    staff s
    JOIN store ON s.staff_id = store.manager_staff_id
    JOIN address a ON store.address_id = a.address_id
    JOIN city c ON a.city_id = c.city_id;

-- Q18. Get the total revenue (sum of amount) collected by each staff member.
--      Show staff first_name, last_name, and total_revenue.
SELECT first_name, last_name, sum(amount)
FROM staff
    INNER JOIN payment ON staff.staff_id = payment.staff_id
GROUP BY
    first_name,
    last_name;

-- Q19. Get all customers who have never made a rental.
SELECT *
FROM customer
WHERE
    customer_id NOT IN (
        SELECT customer_id
        FROM rental
    );

-- SELECT customer_id FROM rental GROUP BY customer_id ORDER BY customer_id;
-- SELECT * FROM customer;

-- Q20. Get the top 5 most rented films (by number of times rented).
--      Show film title and rental_count.
-- SELECT * FROM inventory;
SELECT film.title, count(film.film_id)
FROM film
    JOIN inventory on film.film_id = inventory.film_id
    INNER JOIN rental ON inventory.inventory_id = rental.inventory_id
    -- INNER JOIN payment ON payment.rental_id=rental.rental_id
GROUP BY
    film.film_id
ORDER BY count(inventory.film_id) DESC
LIMIT 5;

-- ************************************************************
-- HARD (10 Questions) - Multi-JOINs, Subqueries, CTEs, Window Functions
-- ************************************************************

-- Q21. Get each customer's full name, email, and the total amount they have spent on rentals.
--      Sort by total amount descending. Show top 10 customers.
SELECT concat(
        c.first_name, ' ', c.last_name
    ) as full_name, c.email, sum(p.amount)
from
    customer c
    INNER JOIN rental r ON c.customer_id = r.customer_id
    INNER JOIN payment p ON p.rental_id = r.rental_id
GROUP BY
    full_name,
    email
ORDER BY sum(p.amount) DESC
LIMIT 10;

-- Q22. For each film, show the title, category name, and the number of times it was rented.
SELECT f.title, c.name, count(f.title)
FROM
    film f
    JOIN film_category fc ON f.film_id = fc.film_id
    JOIN category c ON fc.category_id = c.category_id
    INNER JOIN inventory ON f.film_id = inventory.film_id
    INNER JOIN rental ON inventory.inventory_id = rental.inventory_id
GROUP BY
    f.title,
    c.name
ORDER BY count(f.title) DESC;

-- Q23. Get the average rental duration (in days) per film category.
--      Use (return_date - rental_date) to calculate duration.
SELECT c.name, ROUND(
        avg(
            extract(
                day
                FROM (
                        (
                            rental.return_date - rental.rental_date
                        )
                    )
            )
        )
    )
FROM
    film f
    JOIN film_category fc ON f.film_id = fc.film_id
    JOIN category c ON fc.category_id = c.category_id
    INNER JOIN inventory ON f.film_id = inventory.film_id
    INNER JOIN rental ON inventory.inventory_id = rental.inventory_id
GROUP BY (c.name);

-- Q24. Find actors who have appeared in films across more than 10 different categories.

-- SELECT DISTINCT first_name,last_name from actor;

SELECT concat(
        actor.first_name, ' ', actor.last_name
    ) as actor_name, count(category.name)
FROM
    actor
    JOIN film_actor ON film_actor.actor_id = actor.actor_id
    JOIN film ON film.film_id = film_actor.film_id
    JOIN film_category ON film_category.film_id = film.film_id
    JOIN category ON category.category_id = film_category.category_id
GROUP BY
    actor_name
HAVING
    count(DISTINCT category.category_id) > 10;

-- Q25. Get the monthly revenue for the year 2007 (one row per month).
--      Show month number and total_revenue.
SELECT to_char(payment_date, 'Month') as Month_Name, sum(amount) as Total_Revenue
FROM payment
WHERE
    extract(
        YEAR
        FROM payment.payment_date
    ) = 2007
GROUP BY
    EXTRACT(
        MONTH
        FROM (payment_date)
    ),
    Month_Name;

-- Q26. Rank customers by their total payment amount within each store using a window function.
--      Show store_id, customer full name, total_amount, and rank.
SELECT
    customer.store_id,
    concat(
        customer.first_name,
        ' ',
        customer.last_name
    ) as full_name,
    sum(amount) as Total_Amount,
    DENSE_RANK() OVER (
        PARTITION BY
            customer.store_id
        ORDER BY sum(amount) DESC
    ) as Rank
FROM customer
    JOIN payment ON customer.customer_id = payment.customer_id
GROUP BY
    customer.store_id,
    full_name;

-- Q27. Find films that have never been rented.
SELECT f.title
FROM
    film f
    LEFT JOIN inventory i ON f.film_id = i.film_id
    LEFT JOIN rental ON i.inventory_id = rental.inventory_id
WHERE
    rental.rental_id is NULL;

-- Q28. For each country, get the total number of customers.
--      Show country name and customer_count, sorted by customer_count descending.
SELECT country.country, count(*) as Customer_Count
FROM
    customer c
    JOIN address a ON c.address_id = a.address_id
    JOIN city ON a.city_id = city.city_id
    JOIN country ON city.country_id = country.country_id
GROUP BY
    country.country
ORDER BY count(*) DESC;

-- SELECT * FROM country WHERE country NOT IN (SELECT country.country FROM customer c
-- JOIN address a ON c.address_id=a.address_id
-- JOIN city ON a.city_id=city.city_id
-- JOIN country ON city.country_id=country.country_id
-- GROUP BY country.country
-- ORDER BY count(*) DESC
-- );

-- Q29. Find pairs of actors who have appeared together in more than 3 films.
--      Show actor1 name, actor2 name, and the number of shared films.
    SELECT
    a1.first_name || ' ' || a1.last_name AS actor1,
    a2.first_name || ' ' || a2.last_name AS actor2,
    COUNT(*) AS shared_films
FROM
    film_actor fa1
    JOIN film_actor fa2 ON fa1.film_id = fa2.film_id
    AND fa1.actor_id < fa2.actor_id
    JOIN actor a1 ON fa1.actor_id = a1.actor_id
    JOIN actor a2 ON fa2.actor_id = a2.actor_id
GROUP BY
    a1.actor_id,
    actor1,
    a2.actor_id,
    actor1
HAVING
    COUNT(*) > 3
ORDER BY shared_films DESC;

-- Q30. Using a CTE, find the top 3 spending customers per store.
--      Show store_id, customer full name, and total_spent.
SELECT *
FROM (
        WITH
            Temp as (
                SELECT
                    customer.store_id, customer.customer_id, concat(
                        customer.first_name, ' ', customer.last_name
                    ) as full_name, sum(amount) as Total_Amount, DENSE_RANK() OVER (
                        PARTITION BY
                            customer.store_id
                        ORDER BY sum(amount) DESC
                    ) as Rank
                FROM customer
                    JOIN payment ON customer.customer_id = payment.customer_id
                GROUP BY
                    customer.store_id, customer.customer_id, full_name
            )
        SELECT *
        FROM Temp
        ORDER BY Rank
        LIMIT 6
    )
ORDER BY store_id;