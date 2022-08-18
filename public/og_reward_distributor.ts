export type OgRewardDistributor = {
  "version": "0.1.0",
  "name": "og_reward_distributor",
  "instructions": [
    {
      "name": "initRewardDistributor",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authorityTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ix",
          "type": {
            "defined": "InitRewardDistributorIx"
          }
        }
      ]
    },
    {
      "name": "initRewardEntry",
      "accounts": [
        {
          "name": "rewardEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ix",
          "type": {
            "defined": "UpdateRewardEntryIx"
          }
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "rewardEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userRewardMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardManager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeRewardDistributor",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeRewardEntry",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "updateRewardDistributor",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "ix",
          "type": {
            "defined": "UpdateRewardDistributorIx"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "rewardEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "stakeEntry",
            "type": "publicKey"
          },
          {
            "name": "rewardDistributor",
            "type": "publicKey"
          },
          {
            "name": "rewardSecondsReceived",
            "type": "i128"
          },
          {
            "name": "multiplier",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "rewardDistributor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "stakePool",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "rewardMint",
            "type": "publicKey"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardDurationSeconds",
            "type": "i128"
          },
          {
            "name": "rewardsIssued",
            "type": "i128"
          },
          {
            "name": "multiplierDecimals",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitRewardDistributorIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardDurationSeconds",
            "type": "u128"
          },
          {
            "name": "supply",
            "type": {
              "option": "f64"
            }
          },
          {
            "name": "multiplierDecimals",
            "type": {
              "option": "u8"
            }
          }
        ]
      }
    },
    {
      "name": "UpdateRewardEntryIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "multiplier",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UpdateRewardDistributorIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardDurationSeconds",
            "type": "u128"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6001,
      "name": "InvalidRewardMint",
      "msg": "Invalid reward mint"
    },
    {
      "code": 6002,
      "name": "InvalidUserRewardMintTokenAccount",
      "msg": "Invalid user reward mint token account"
    },
    {
      "code": 6003,
      "name": "InvalidRewardDistributor",
      "msg": "Invalid reward distributor"
    },
    {
      "code": 6004,
      "name": "InvalidRewardDistributorAuthority",
      "msg": "Invalid reward distributor authority"
    },
    {
      "code": 6005,
      "name": "InvalidRewardDistributorKind",
      "msg": "Invalid reward distributor kind"
    },
    {
      "code": 6006,
      "name": "SupplyRequired",
      "msg": "Initial supply required for kind treasury"
    },
    {
      "code": 6007,
      "name": "InvalidAuthority",
      "msg": "Invalid authority"
    },
    {
      "code": 6008,
      "name": "InvalidPoolDistributor",
      "msg": "Invalid distributor for pool"
    },
    {
      "code": 6009,
      "name": "DistributorNotClosed",
      "msg": "Distributor is already open"
    },
    {
      "code": 6010,
      "name": "DistributorAlreadyClosed",
      "msg": "Distributor is already closed"
    },
    {
      "code": 6011,
      "name": "InvalidStakeEntry",
      "msg": "Invalid stake entry"
    },
    {
      "code": 6012,
      "name": "InvalidRewardEntry",
      "msg": "Invalid reward entry"
    }
  ]
};

export const IDL: OgRewardDistributor = {
  "version": "0.1.0",
  "name": "og_reward_distributor",
  "instructions": [
    {
      "name": "initRewardDistributor",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authorityTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ix",
          "type": {
            "defined": "InitRewardDistributorIx"
          }
        }
      ]
    },
    {
      "name": "initRewardEntry",
      "accounts": [
        {
          "name": "rewardEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ix",
          "type": {
            "defined": "UpdateRewardEntryIx"
          }
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "rewardEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userRewardMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardManager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeRewardDistributor",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeRewardEntry",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "updateRewardDistributor",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "ix",
          "type": {
            "defined": "UpdateRewardDistributorIx"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "rewardEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "stakeEntry",
            "type": "publicKey"
          },
          {
            "name": "rewardDistributor",
            "type": "publicKey"
          },
          {
            "name": "rewardSecondsReceived",
            "type": "i128"
          },
          {
            "name": "multiplier",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "rewardDistributor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "stakePool",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "rewardMint",
            "type": "publicKey"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardDurationSeconds",
            "type": "i128"
          },
          {
            "name": "rewardsIssued",
            "type": "i128"
          },
          {
            "name": "multiplierDecimals",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitRewardDistributorIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardDurationSeconds",
            "type": "u128"
          },
          {
            "name": "supply",
            "type": {
              "option": "f64"
            }
          },
          {
            "name": "multiplierDecimals",
            "type": {
              "option": "u8"
            }
          }
        ]
      }
    },
    {
      "name": "UpdateRewardEntryIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "multiplier",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UpdateRewardDistributorIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardDurationSeconds",
            "type": "u128"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6001,
      "name": "InvalidRewardMint",
      "msg": "Invalid reward mint"
    },
    {
      "code": 6002,
      "name": "InvalidUserRewardMintTokenAccount",
      "msg": "Invalid user reward mint token account"
    },
    {
      "code": 6003,
      "name": "InvalidRewardDistributor",
      "msg": "Invalid reward distributor"
    },
    {
      "code": 6004,
      "name": "InvalidRewardDistributorAuthority",
      "msg": "Invalid reward distributor authority"
    },
    {
      "code": 6005,
      "name": "InvalidRewardDistributorKind",
      "msg": "Invalid reward distributor kind"
    },
    {
      "code": 6006,
      "name": "SupplyRequired",
      "msg": "Initial supply required for kind treasury"
    },
    {
      "code": 6007,
      "name": "InvalidAuthority",
      "msg": "Invalid authority"
    },
    {
      "code": 6008,
      "name": "InvalidPoolDistributor",
      "msg": "Invalid distributor for pool"
    },
    {
      "code": 6009,
      "name": "DistributorNotClosed",
      "msg": "Distributor is already open"
    },
    {
      "code": 6010,
      "name": "DistributorAlreadyClosed",
      "msg": "Distributor is already closed"
    },
    {
      "code": 6011,
      "name": "InvalidStakeEntry",
      "msg": "Invalid stake entry"
    },
    {
      "code": 6012,
      "name": "InvalidRewardEntry",
      "msg": "Invalid reward entry"
    }
  ]
};
