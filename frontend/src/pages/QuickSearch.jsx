import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCars } from "../api/carsAPI";
import "../resources/quicksearch.css";
import BackButton from "../components/BackButton";
import CarPreview from "../components/CarPreview";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";

const QuickSearch = () => {
  const location = useLocation();
  const [cars, setCars] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Current page index
  const [pageSize] = useState(10); // Cars per page
  const [totalCars, setTotalCars] = useState(0); // Total cars count
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [pageTitle, setPageTitle] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const make = searchParams.get("make");
  const type = searchParams.get("type");
  const city = searchParams.get("location");

  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true);
      try {
        // build dynamic object
        const query = {};
        if (make) {
          query.make = make;
          setPageTitle(`${make} cars available`);
        }
        if (type) {
          query.type = type;
          setPageTitle(`${type} cars available`);
        }
        if (city) {
          query.location = city;
          setPageTitle(`Cars available in ${city}`);
        }

        const response = await getCars(query);
        if (response && response.data) {
          setCars(response.data.cars);
          setTotalCars(response.data.cars?.length);
          setCurrentPage(0); // reset pagination to first page
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, [make, type, city]);

  const paginatedCars = cars?.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="filtered-results-page">
      <BackButton />
      <h2>{pageTitle}</h2>
      {cars.length > 0 ? (
        <>
          {paginatedCars.map((car) => (
            <CarPreview car={car} width={250} key={car._id} />
          ))}
          <Pagination
            totalCars={totalCars}
            pageSize={pageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </>
      ) : (
        <p className="no-cars-found">No cars found.</p>
      )}
    </div>
  );
};

export default QuickSearch;
