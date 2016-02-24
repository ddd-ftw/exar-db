extern crate exar;

use exar::*;

#[test]
fn test_connection() {
    let mut db = Database::new(DatabaseConfig::default());

    let collection_name = "test-connection";

    let collection = db.get_collection(collection_name).expect("Unable to get collection");

    let conn = Connection::new(collection);

    let test_event = Event::new("data", vec!["tag1", "tag2"]);
    assert!(conn.publish(test_event.clone()).is_ok());

    let query = Query::current();
    let retrieved_events: Vec<_> = conn.subscribe(query).unwrap().map(|e| e.unwrap()).take(1).collect();
    let expected_event = test_event.clone().with_id(1).with_timestamp(retrieved_events[0].timestamp);
    assert_eq!(retrieved_events, vec![expected_event]);

    assert!(db.drop_collection(collection_name).is_ok());
    assert!(!db.contains_collection(collection_name));
}
