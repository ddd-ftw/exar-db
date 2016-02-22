#[cfg_attr(feature = "rustc-serialization", derive(RustcEncodable, RustcDecodable))]
#[cfg_attr(feature = "serde-serialization", derive(Serialize, Deserialize))]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ServerConfig  {
    pub host: String,
    pub port: u16,
    pub username: Option<String>,
    pub password: Option<String>
}

impl Default for ServerConfig {
    fn default() -> ServerConfig {
        ServerConfig {
            host: "127.0.0.1".to_owned(),
            port: 38580,
            username: None,
            password: None
        }
    }
}

impl ServerConfig {
    pub fn address(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}
